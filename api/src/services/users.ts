import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { Knex } from 'knex';
import { clone, cloneDeep } from 'lodash';
import getDatabase from '../database';
import env from '../env';
import { FailedValidationException } from '@directus/shared/exceptions';
import {
	ForbiddenException,
	InvalidPayloadException,
	UnprocessableEntityException,
	InvalidCredentialsException,
} from '../exceptions';
import { RecordNotUniqueException } from '../exceptions/database/record-not-unique';
import logger from '../logger';
import { AbstractServiceOptions, Item, PrimaryKey, Query, SchemaOverview } from '../types';
import { Accountability } from '@directus/shared/types';
import isUrlAllowed from '../utils/is-url-allowed';
import { toArray } from '@directus/shared/utils';
import { AuthenticationService } from './authentication';
import { ItemsService, MutationOptions } from './items';
import { MailService } from './mail';
import { SettingsService } from './settings';
import { stall } from '../utils/stall';
import { performance } from 'perf_hooks';

export class UsersService extends ItemsService {
	knex: Knex;
	accountability: Accountability | null;
	schema: SchemaOverview;
	service: ItemsService;

	constructor(options: AbstractServiceOptions) {
		super('directus_users', options);

		this.knex = options.knex || getDatabase();
		this.accountability = options.accountability || null;
		this.service = new ItemsService('directus_users', options);
		this.schema = options.schema;
	}

	/**
	 * User email has to be unique case-insensitive. This is an additional check to make sure that
	 * the email is unique regardless of casing
	 */
	private async checkUniqueEmails(emails: string[], excludeKey?: PrimaryKey) {
		if (emails.length > 0) {
			const query = this.knex
				.select('email')
				.from('directus_users')
				.whereRaw(`LOWER(??) IN (${emails.map(() => '?')})`, ['email', ...emails]);

			if (excludeKey) {
				query.whereNot('id', excludeKey);
			}

			const results = await query;

			if (results.length > 0) {
				throw new RecordNotUniqueException('email', {
					collection: 'directus_users',
					field: 'email',
					invalid: results[0].email,
				});
			}
		}
	}

	/**
	 * Check if the provided password matches the strictness as configured in
	 * directus_settings.auth_password_policy
	 */
	private async checkPasswordPolicy(passwords: string[]) {
		const settingsService = new SettingsService({
			schema: this.schema,
			knex: this.knex,
		});

		const { auth_password_policy: policyRegExString } = await settingsService.readSingleton({
			fields: ['auth_password_policy'],
		});

		if (policyRegExString) {
			const wrapped = policyRegExString.startsWith('/') && policyRegExString.endsWith('/');

			const regex = new RegExp(wrapped ? policyRegExString.slice(1, -1) : policyRegExString);

			for (const password of passwords) {
				if (regex.test(password) === false) {
					throw new FailedValidationException({
						message: `Provided password doesn't match password policy`,
						path: ['password'],
						type: 'custom.pattern.base',
						context: {
							value: password,
						},
					});
				}
			}
		}

		return true;
	}

	private async checkRemainingAdminExistence(excludeKeys: PrimaryKey[]) {
		// Make sure there's at least one admin user left after this deletion is done
		const otherAdminUsers = await this.knex
			.count('*', { as: 'count' })
			.from('directus_users')
			.whereNotIn('directus_users.id', excludeKeys)
			.andWhere({ 'directus_roles.admin_access': true })
			.leftJoin('directus_roles', 'directus_users.role', 'directus_roles.id')
			.first();

		const otherAdminUsersCount = +(otherAdminUsers?.count || 0);

		if (otherAdminUsersCount === 0) {
			throw new UnprocessableEntityException(`You can't remove the last admin user from the role.`);
		}
	}

	/**
	 * Create a new user
	 */
	async createOne(data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey> {
		const email = data.email?.toLowerCase();

		if (email) {
			await this.checkUniqueEmails([email]);
		}

		return await this.service.createOne(data, opts);
	}

	/**
	 * Create multiple new users
	 */
	async createMany(data: Partial<Item>[], opts?: MutationOptions): Promise<PrimaryKey[]> {
		const emails = data
			.map((payload: Record<string, any>) => payload.email)
			.filter((e) => e)
			.map((e) => e.toLowerCase()) as string[];

		await this.checkUniqueEmails(emails);

		const passwords = data.map((payload) => payload.password).filter((pw) => pw);

		if (passwords.length > 0) {
			await this.checkPasswordPolicy(passwords);
		}

		return await this.service.createMany(data, opts);
	}

	async updateOne(key: PrimaryKey, data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey> {
		if (data.role) {
			const newRole = await this.knex.select('admin_access').from('directus_roles').where('id', data.role).first();

			if (newRole && !newRole.admin_access) {
				await this.checkRemainingAdminExistence([key]);
			}
		}

		const email = data.email?.toLowerCase();

		if (email) {
			await this.checkUniqueEmails([email], key);
		}

		if (data.password) {
			await this.checkPasswordPolicy([data.password]);
		}

		if ('tfa_secret' in data) {
			throw new InvalidPayloadException(`You can't change the "tfa_secret" value manually.`);
		}

		return await this.service.updateOne(key, data, opts);
	}

	async updateMany(keys: PrimaryKey[], data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey[]> {
		if (data.role) {
			const newRole = await this.knex.select('admin_access').from('directus_roles').where('id', data.role).first();

			if (newRole && !newRole.admin_access) {
				await this.checkRemainingAdminExistence(keys);
			}
		}

		const email = data.email?.toLowerCase();

		if (email) {
			await this.checkUniqueEmails([email]);
		}

		if (data.password) {
			await this.checkPasswordPolicy([data.password]);
		}

		if ('tfa_secret' in data) {
			throw new InvalidPayloadException(`You can't change the "tfa_secret" value manually.`);
		}

		return await this.service.updateMany(keys, data, opts);
	}

	async updateByQuery(query: Query, data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey[]> {
		if (data.role) {
			const newRole = await this.knex.select('admin_access').from('directus_roles').where('id', data.role).first();

			if (newRole && !newRole.admin_access) {
				// This is duplicated a touch, but we need to know the keys first
				// Not authenticated:
				const itemsService = new ItemsService('directus_users', {
					knex: this.knex,
					schema: this.schema,
				});

				const readQuery = cloneDeep(query);
				readQuery.fields = ['id'];

				// We read the IDs of the items based on the query, and then run `updateMany`. `updateMany` does it's own
				// permissions check for the keys, so we don't have to make this an authenticated read
				const itemsToUpdate = await itemsService.readByQuery(readQuery);
				const keys = itemsToUpdate.map((item) => item.id);

				await this.checkRemainingAdminExistence(keys);
			}
		}

		const email = data.email?.toLowerCase();

		if (email) {
			await this.checkUniqueEmails([email]);
		}

		if (data.password) {
			await this.checkPasswordPolicy([data.password]);
		}

		if ('tfa_secret' in data) {
			throw new InvalidPayloadException(`You can't change the "tfa_secret" value manually.`);
		}

		return await this.service.updateByQuery(query, data, opts);
	}

	async deleteOne(key: PrimaryKey, opts?: MutationOptions): Promise<PrimaryKey> {
		await this.checkRemainingAdminExistence([key]);

		await this.service.deleteOne(key, opts);

		return key;
	}

	async deleteMany(keys: PrimaryKey[], opts?: MutationOptions): Promise<PrimaryKey[]> {
		await this.checkRemainingAdminExistence(keys);

		await this.service.deleteMany(keys, opts);

		return keys;
	}

	async deleteByQuery(query: Query, opts?: MutationOptions): Promise<PrimaryKey[]> {
		const primaryKeyField = this.schema.collections[this.collection].primary;
		const readQuery = cloneDeep(query);
		readQuery.fields = [primaryKeyField];

		// Not authenticated:
		const itemsService = new ItemsService(this.collection, {
			knex: this.knex,
			schema: this.schema,
		});

		const itemsToDelete = await itemsService.readByQuery(readQuery);
		const keys: PrimaryKey[] = itemsToDelete.map((item: Item) => item[primaryKeyField]);

		if (keys.length === 0) return [];

		return await this.deleteMany(keys, opts);
	}

	async inviteUser(email: string | string[], role: string, url: string | null, subject?: string | null): Promise<void> {
		const emails = toArray(email);

		if (url && isUrlAllowed(url, env.USER_INVITE_URL_ALLOW_LIST) === false) {
			throw new InvalidPayloadException(`Url "${url}" can't be used to invite users.`);
		}

		await this.knex.transaction(async (trx) => {
			const service = new ItemsService('directus_users', {
				schema: this.schema,
				accountability: this.accountability,
				knex: trx,
			});

			const mailService = new MailService({
				schema: this.schema,
				accountability: this.accountability,
				knex: trx,
			});

			for (const email of emails) {
				await service.createOne({ email, role, status: 'invited' });

				const payload = { email, scope: 'invite' };
				const token = jwt.sign(payload, env.SECRET as string, { expiresIn: '7d' });
				const inviteURL = url ?? env.PUBLIC_URL + '/admin/accept-invite';
				const acceptURL = inviteURL + '?token=' + token;
				const subjectLine = subject ? subject : "You've been invited";

				await mailService.send({
					to: email,
					subject: subjectLine,
					template: {
						name: 'user-invitation',
						data: {
							url: acceptURL,
							email,
						},
					},
				});
			}
		});
	}

	async acceptInvite(token: string, password: string): Promise<void> {
		const { email, scope } = jwt.verify(token, env.SECRET as string) as {
			email: string;
			scope: string;
		};

		if (scope !== 'invite') throw new ForbiddenException();

		const user = await this.knex.select('id', 'status').from('directus_users').where({ email }).first();

		if (!user || user.status !== 'invited') {
			throw new InvalidPayloadException(`Email address ${email} hasn't been invited.`);
		}

		const passwordHashed = await argon2.hash(password);

		await this.knex('directus_users').update({ password: passwordHashed, status: 'active' }).where({ id: user.id });

		if (this.cache && env.CACHE_AUTO_PURGE) {
			await this.cache.clear();
		}
	}

	async requestPasswordReset(email: string, url: string | null, subject?: string | null): Promise<void> {
		const STALL_TIME = 500;
		const timeStart = performance.now();

		const user = await this.knex.select('id').from('directus_users').where({ email }).first();
		if (!user) {
			await stall(STALL_TIME, timeStart);
			throw new ForbiddenException();
		}

		const mailService = new MailService({
			schema: this.schema,
			knex: this.knex,
			accountability: this.accountability,
		});

		const payload = { email, scope: 'password-reset' };
		const token = jwt.sign(payload, env.SECRET as string, { expiresIn: '1d' });

		if (url && isUrlAllowed(url, env.PASSWORD_RESET_URL_ALLOW_LIST) === false) {
			throw new InvalidPayloadException(`Url "${url}" can't be used to reset passwords.`);
		}

		const acceptURL = url ? `${url}?token=${token}` : `${env.PUBLIC_URL}/admin/reset-password?token=${token}`;
		const subjectLine = subject ? subject : 'Password Reset Request';

		await mailService.send({
			to: email,
			subject: subjectLine,
			template: {
				name: 'password-reset',
				data: {
					url: acceptURL,
					email,
				},
			},
		});

		await stall(STALL_TIME, timeStart);
	}

	async resetPassword(token: string, password: string): Promise<void> {
		const { email, scope } = jwt.verify(token, env.SECRET as string) as {
			email: string;
			scope: string;
		};

		if (scope !== 'password-reset') throw new ForbiddenException();

		const user = await this.knex.select('id', 'status').from('directus_users').where({ email }).first();

		if (!user || user.status !== 'active') {
			throw new ForbiddenException();
		}

		const passwordHashed = await argon2.hash(password);

		await this.knex('directus_users').update({ password: passwordHashed, status: 'active' }).where({ id: user.id });

		if (this.cache && env.CACHE_AUTO_PURGE) {
			await this.cache.clear();
		}
	}

	async generateTFA(pk: string): Promise<Record<string, string>> {
		const user = await this.knex.select('tfa_secret').from('directus_users').where({ id: pk }).first();

		if (user?.tfa_secret !== null) {
			throw new InvalidPayloadException('TFA Secret is already set for this user');
		}

		const authService = new AuthenticationService({
			knex: this.knex,
			schema: this.schema,
			accountability: this.accountability,
		});
		const secret = authService.generateTFASecret();

		return {
			secret,
			url: await authService.generateOTPAuthURL(pk, secret),
		};
	}

	async enableTFA(pk: string, otp: string, secret: string): Promise<void> {
		const authService = new AuthenticationService({
			schema: this.schema,
		});

		if (!pk) {
			throw new InvalidCredentialsException();
		}

		const otpValid = await authService.verifyOTP(pk, otp, secret);

		if (otpValid === false) {
			throw new InvalidPayloadException(`"otp" is invalid`);
		}

		const userSecret = await this.knex.select('tfa_secret').from('directus_users').where({ id: pk }).first();

		if (userSecret?.tfa_secret !== null) {
			throw new InvalidPayloadException('TFA Secret is already set for this user');
		}

		await this.knex('directus_users').update({ tfa_secret: secret }).where({ id: pk });
	}

	async disableTFA(pk: string): Promise<void> {
		await this.knex('directus_users').update({ tfa_secret: null }).where({ id: pk });
	}

	/**
	 * @deprecated Use `createOne` or `createMany` instead
	 */
	async create(data: Partial<Item>[]): Promise<PrimaryKey[]>;
	async create(data: Partial<Item>): Promise<PrimaryKey>;
	async create(data: Partial<Item> | Partial<Item>[]): Promise<PrimaryKey | PrimaryKey[]> {
		logger.warn(
			'UsersService.create is deprecated and will be removed before v9.0.0. Use createOne or createMany instead.'
		);

		if (Array.isArray(data)) return this.createMany(data);
		return this.createOne(data);
	}

	/**
	 * @deprecated Use `updateOne` or `updateMany` instead
	 */
	update(data: Partial<Item>, keys: PrimaryKey[]): Promise<PrimaryKey[]>;
	update(data: Partial<Item>, key: PrimaryKey): Promise<PrimaryKey>;
	update(data: Partial<Item>[]): Promise<PrimaryKey[]>;
	async update(
		data: Partial<Item> | Partial<Item>[],
		key?: PrimaryKey | PrimaryKey[]
	): Promise<PrimaryKey | PrimaryKey[]> {
		if (Array.isArray(key)) return await this.updateMany(key, data);
		else if (key) await this.updateOne(key, data);

		const primaryKeyField = this.schema.collections[this.collection].primary;

		const keys: PrimaryKey[] = [];

		await this.knex.transaction(async (trx) => {
			const itemsService = new ItemsService(this.collection, {
				accountability: this.accountability,
				knex: trx,
				schema: this.schema,
			});

			const payloads = toArray(data);

			for (const single of payloads as Partial<Item>[]) {
				const payload = clone(single);
				const key = payload[primaryKeyField];

				if (!key) {
					throw new InvalidPayloadException('Primary key is missing in update payload.');
				}

				keys.push(key);

				await itemsService.updateOne(key, payload);
			}
		});

		return keys;
	}

	/**
	 * @deprecated Use `deleteOne` or `deleteMany` instead
	 */
	delete(key: PrimaryKey): Promise<PrimaryKey>;
	delete(keys: PrimaryKey[]): Promise<PrimaryKey[]>;
	async delete(key: PrimaryKey | PrimaryKey[]): Promise<PrimaryKey | PrimaryKey[]> {
		if (Array.isArray(key)) return await this.deleteMany(key);
		return await this.deleteOne(key);
	}
}
