import argon2 from 'argon2';
import { format, parseISO } from 'date-fns';
import Joi from 'joi';
import { Knex } from 'knex';
import { clone, cloneDeep, isObject, isPlainObject, omit } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import getDatabase from '../database';
import { ForbiddenException, InvalidPayloadException } from '../exceptions';
import { AbstractServiceOptions, Item, PrimaryKey, Query, SchemaOverview, Alterations } from '../types';
import { Accountability } from '@directus/shared/types';
import { toArray } from '@directus/shared/utils';
import { ItemsService } from './items';

type Action = 'create' | 'read' | 'update';

type Transformers = {
	[type: string]: (context: {
		action: Action;
		value: any;
		payload: Partial<Item>;
		accountability: Accountability | null;
	}) => Promise<any>;
};

/**
 * Process a given payload for a collection to ensure the special fields (hash, uuid, date etc) are
 * handled correctly.
 */
export class PayloadService {
	accountability: Accountability | null;
	knex: Knex;
	collection: string;
	schema: SchemaOverview;

	constructor(collection: string, options: AbstractServiceOptions) {
		this.accountability = options.accountability || null;
		this.knex = options.knex || getDatabase();
		this.collection = collection;
		this.schema = options.schema;

		return this;
	}

	public transformers: Transformers = {
		async hash({ action, value }) {
			if (!value) return;

			if (action === 'create' || action === 'update') {
				return await argon2.hash(String(value));
			}

			return value;
		},
		async uuid({ action, value }) {
			if (action === 'create' && !value) {
				return uuidv4();
			}

			return value;
		},
		async boolean({ action, value }) {
			if (action === 'read') {
				return value === true || value === 1 || value === '1';
			}

			return value;
		},
		async json({ action, value }) {
			if (action === 'read') {
				if (typeof value === 'string') {
					try {
						return JSON.parse(value);
					} catch {
						return value;
					}
				}
			}

			return value;
		},
		async conceal({ action, value }) {
			if (action === 'read') return value ? '**********' : null;
			return value;
		},
		async 'user-created'({ action, value, accountability }) {
			if (action === 'create') return accountability?.user || null;
			return value;
		},
		async 'user-updated'({ action, value, accountability }) {
			if (action === 'update') return accountability?.user || null;
			return value;
		},
		async 'role-created'({ action, value, accountability }) {
			if (action === 'create') return accountability?.role || null;
			return value;
		},
		async 'role-updated'({ action, value, accountability }) {
			if (action === 'update') return accountability?.role || null;
			return value;
		},
		async 'date-created'({ action, value }) {
			if (action === 'create') return new Date();
			return value;
		},
		async 'date-updated'({ action, value }) {
			if (action === 'update') return new Date();
			return value;
		},
		async csv({ action, value }) {
			if (!value) return;
			if (action === 'read') return value.split(',');

			if (Array.isArray(value)) return value.join(',');
			return value;
		},
	};

	processValues(action: Action, payloads: Partial<Item>[]): Promise<Partial<Item>[]>;
	processValues(action: Action, payload: Partial<Item>): Promise<Partial<Item>>;
	async processValues(
		action: Action,
		payload: Partial<Item> | Partial<Item>[]
	): Promise<Partial<Item> | Partial<Item>[]> {
		const processedPayload = toArray(payload);

		if (processedPayload.length === 0) return [];

		const fieldsInPayload = Object.keys(processedPayload[0]);

		let specialFieldsInCollection = Object.entries(this.schema.collections[this.collection].fields).filter(
			([_name, field]) => field.special && field.special.length > 0
		);

		if (action === 'read') {
			specialFieldsInCollection = specialFieldsInCollection.filter(([name]) => {
				return fieldsInPayload.includes(name);
			});
		}

		await Promise.all(
			processedPayload.map(async (record: any) => {
				await Promise.all(
					specialFieldsInCollection.map(async ([name, field]) => {
						const newValue = await this.processField(field, record, action, this.accountability);
						if (newValue !== undefined) record[name] = newValue;
					})
				);
			})
		);

		await this.processDates(processedPayload, action);

		if (['create', 'update'].includes(action)) {
			processedPayload.forEach((record) => {
				for (const [key, value] of Object.entries(record)) {
					if (Array.isArray(value) || (typeof value === 'object' && value instanceof Date !== true && value !== null)) {
						record[key] = JSON.stringify(value);
					}
				}
			});
		}

		if (Array.isArray(payload)) {
			return processedPayload;
		}

		return processedPayload[0];
	}

	async processField(
		field: SchemaOverview['collections'][string]['fields'][string],
		payload: Partial<Item>,
		action: Action,
		accountability: Accountability | null
	): Promise<any> {
		if (!field.special) return payload[field.field];
		const fieldSpecials = field.special ? toArray(field.special) : [];

		let value = clone(payload[field.field]);

		for (const special of fieldSpecials) {
			if (special in this.transformers) {
				value = await this.transformers[special]({
					action,
					value,
					payload,
					accountability,
				});
			}
		}

		return value;
	}

	/**
	 * Knex returns `datetime` and `date` columns as Date.. This is wrong for date / datetime, as those
	 * shouldn't return with time / timezone info respectively
	 */
	async processDates(
		payloads: Partial<Record<string, any>>[],
		action: Action
	): Promise<Partial<Record<string, any>>[]> {
		const fieldsInCollection = Object.entries(this.schema.collections[this.collection].fields);

		const dateColumns = fieldsInCollection.filter(([_name, field]) =>
			['dateTime', 'date', 'timestamp'].includes(field.type)
		);

		const timeColumns = fieldsInCollection.filter(([_name, field]) => {
			return field.type === 'time';
		});

		if (dateColumns.length === 0 && timeColumns.length === 0) return payloads;

		for (const [name, dateColumn] of dateColumns) {
			for (const payload of payloads) {
				let value: number | string | Date = payload[name];

				if (value === null || value === '0000-00-00') {
					payload[name] = null;
					continue;
				}

				if (!value) continue;

				if (action === 'read') {
					if (typeof value === 'number' || typeof value === 'string') {
						value = new Date(value);
					}

					if (dateColumn.type === 'timestamp') {
						const newValue = value.toISOString();
						payload[name] = newValue;
					}

					if (dateColumn.type === 'dateTime') {
						const year = String(value.getUTCFullYear());
						const month = String(value.getUTCMonth() + 1).padStart(2, '0');
						const date = String(value.getUTCDate()).padStart(2, '0');
						const hours = String(value.getUTCHours()).padStart(2, '0');
						const minutes = String(value.getUTCMinutes()).padStart(2, '0');
						const seconds = String(value.getUTCSeconds()).padStart(2, '0');

						const newValue = `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`;
						payload[name] = newValue;
					}

					if (dateColumn.type === 'date') {
						const [year, month, day] = value.toISOString().substr(0, 10).split('-');

						// Strip off the time / timezone information from a date-only value
						const newValue = `${year}-${month}-${day}`;
						payload[name] = newValue;
					}
				} else {
					if (value instanceof Date === false && typeof value === 'string') {
						if (dateColumn.type === 'date') {
							const [date] = value.split('T');
							const [year, month, day] = date.split('-');

							payload[name] = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
						}

						if (dateColumn.type === 'dateTime') {
							const [date, time] = value.split('T');
							const [year, month, day] = date.split('-');
							const [hours, minutes, seconds] = time.substring(0, 8).split(':');

							payload[name] = new Date(
								Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds))
							);
						}

						if (dateColumn.type === 'timestamp') {
							const newValue = parseISO(value);
							payload[name] = newValue;
						}
					}
				}
			}
		}

		/**
		 * Some DB drivers (MS SQL f.e.) return time values as Date objects. For consistencies sake,
		 * we'll abstract those back to hh:mm:ss
		 */
		for (const [name] of timeColumns) {
			for (const payload of payloads) {
				const value = payload[name];

				if (!value) continue;

				if (action === 'read') {
					if (value instanceof Date) payload[name] = format(value, 'HH:mm:ss');
				}
			}
		}

		return payloads;
	}

	/**
	 * Recursively save/update all nested related Any-to-One items
	 */
	async processA2O(data: Partial<Item>): Promise<{ payload: Partial<Item>; revisions: PrimaryKey[] }> {
		const relations = this.schema.relations.filter((relation) => {
			return relation.collection === this.collection;
		});

		const revisions: PrimaryKey[] = [];

		const payload = cloneDeep(data);

		// Only process related records that are actually in the payload
		const relationsToProcess = relations.filter((relation) => {
			return relation.field in payload && isPlainObject(payload[relation.field]);
		});

		for (const relation of relationsToProcess) {
			// If the required a2o configuration fields are missing, this is a m2o instead of an a2o
			if (!relation.meta?.one_collection_field || !relation.meta?.one_allowed_collections) continue;

			const relatedCollection = payload[relation.meta.one_collection_field];

			if (!relatedCollection) {
				throw new InvalidPayloadException(
					`Can't update nested record "${relation.collection}.${relation.field}" without field "${relation.collection}.${relation.meta.one_collection_field}" being set`
				);
			}

			const allowedCollections = relation.meta.one_allowed_collections;

			if (allowedCollections.includes(relatedCollection) === false) {
				throw new InvalidPayloadException(
					`"${relation.collection}.${relation.field}" can't be linked to collection "${relatedCollection}`
				);
			}

			const itemsService = new ItemsService(relatedCollection, {
				accountability: this.accountability,
				knex: this.knex,
				schema: this.schema,
			});

			const relatedPrimary = this.schema.collections[relatedCollection].primary;
			const relatedRecord: Partial<Item> = payload[relation.field];

			if (['string', 'number'].includes(typeof relatedRecord)) continue;

			const hasPrimaryKey = relatedPrimary in relatedRecord;

			let relatedPrimaryKey: PrimaryKey = relatedRecord[relatedPrimary];

			const exists =
				hasPrimaryKey &&
				!!(await this.knex
					.select(relatedPrimary)
					.from(relatedCollection)
					.where({ [relatedPrimary]: relatedPrimaryKey })
					.first());

			if (exists) {
				const fieldsToUpdate = omit(relatedRecord, relatedPrimary);

				if (Object.keys(fieldsToUpdate).length > 0) {
					await itemsService.updateOne(relatedPrimaryKey, relatedRecord, {
						onRevisionCreate: (id) => revisions.push(id),
					});
				}
			} else {
				relatedPrimaryKey = await itemsService.createOne(relatedRecord, {
					onRevisionCreate: (id) => revisions.push(id),
				});
			}

			// Overwrite the nested object with just the primary key, so the parent level can be saved correctly
			payload[relation.field] = relatedPrimaryKey;
		}

		return { payload, revisions };
	}

	/**
	 * Save/update all nested related m2o items inside the payload
	 */
	async processM2O(data: Partial<Item>): Promise<{ payload: Partial<Item>; revisions: PrimaryKey[] }> {
		const payload = cloneDeep(data);

		// All the revisions saved on this level
		const revisions: PrimaryKey[] = [];

		// Many to one relations that exist on the current collection
		const relations = this.schema.relations.filter((relation) => {
			return relation.collection === this.collection;
		});

		// Only process related records that are actually in the payload
		const relationsToProcess = relations.filter((relation) => {
			return relation.field in payload && isObject(payload[relation.field]);
		});

		for (const relation of relationsToProcess) {
			// If no "one collection" exists, this is a A2O, not a M2O
			if (!relation.related_collection) continue;
			const relatedPrimaryKeyField = this.schema.collections[relation.related_collection].primary;

			// Items service to the related collection
			const itemsService = new ItemsService(relation.related_collection, {
				accountability: this.accountability,
				knex: this.knex,
				schema: this.schema,
			});

			const relatedRecord: Partial<Item> = payload[relation.field];

			if (['string', 'number'].includes(typeof relatedRecord)) continue;

			const hasPrimaryKey = relatedPrimaryKeyField in relatedRecord;

			let relatedPrimaryKey: PrimaryKey = relatedRecord[relatedPrimaryKeyField];

			const exists =
				hasPrimaryKey &&
				!!(await this.knex
					.select(relatedPrimaryKeyField)
					.from(relation.related_collection)
					.where({ [relatedPrimaryKeyField]: relatedPrimaryKey })
					.first());

			if (exists) {
				const fieldsToUpdate = omit(relatedRecord, relatedPrimaryKeyField);

				if (Object.keys(fieldsToUpdate).length > 0) {
					await itemsService.updateOne(relatedPrimaryKey, relatedRecord, {
						onRevisionCreate: (id) => revisions.push(id),
					});
				}
			} else {
				relatedPrimaryKey = await itemsService.createOne(relatedRecord, {
					onRevisionCreate: (id) => revisions.push(id),
				});
			}

			// Overwrite the nested object with just the primary key, so the parent level can be saved correctly
			payload[relation.field] = relatedPrimaryKey;
		}

		return { payload, revisions };
	}

	/**
	 * Recursively save/update all nested related o2m items
	 */
	async processO2M(data: Partial<Item>, parent: PrimaryKey): Promise<{ revisions: PrimaryKey[] }> {
		const revisions: PrimaryKey[] = [];

		const relations = this.schema.relations.filter((relation) => {
			return relation.related_collection === this.collection;
		});

		const payload = cloneDeep(data);

		// Only process related records that are actually in the payload
		const relationsToProcess = relations.filter((relation) => {
			if (!relation.meta?.one_field) return false;
			return relation.meta.one_field in payload;
		});

		const nestedUpdateSchema = Joi.object({
			create: Joi.array().items(Joi.object().unknown()),
			update: Joi.array().items(Joi.object().unknown()),
			delete: Joi.array().items(Joi.string(), Joi.number()),
		});

		for (const relation of relationsToProcess) {
			if (!relation.meta || !payload[relation.meta.one_field!]) continue;

			const currentPrimaryKeyField = this.schema.collections[relation.related_collection!].primary;
			const relatedPrimaryKeyField = this.schema.collections[relation.collection].primary;

			const itemsService = new ItemsService(relation.collection, {
				accountability: this.accountability,
				knex: this.knex,
				schema: this.schema,
			});

			const recordsToUpsert: Partial<Item>[] = [];
			const savedPrimaryKeys: PrimaryKey[] = [];

			// Nested array of individual items
			if (Array.isArray(payload[relation.meta!.one_field!])) {
				for (let i = 0; i < (payload[relation.meta!.one_field!] || []).length; i++) {
					const relatedRecord = (payload[relation.meta!.one_field!] || [])[i];

					let record = cloneDeep(relatedRecord);

					if (typeof relatedRecord === 'string' || typeof relatedRecord === 'number') {
						const existingRecord = await this.knex
							.select(relatedPrimaryKeyField, relation.field)
							.from(relation.collection)
							.where({ [relatedPrimaryKeyField]: record })
							.first();

						if (!!existingRecord === false) {
							throw new ForbiddenException();
						}

						// If the related item is already associated to the current item, and there's no
						// other updates (which is indicated by the fact that this is just the PK, we can
						// ignore updating this item. This makes sure we don't trigger any update logic
						// for items that aren't actually being updated. NOTE: We use == here, as the
						// primary key might be reported as a string instead of number, coming from the
						// http route, and or a bigInteger in the DB
						if (
							existingRecord[relation.field] == parent ||
							existingRecord[relation.field] == payload[currentPrimaryKeyField]
						) {
							savedPrimaryKeys.push(existingRecord[relatedPrimaryKeyField]);
							continue;
						}

						record = {
							[relatedPrimaryKeyField]: relatedRecord,
						};
					}

					recordsToUpsert.push({
						...record,
						[relation.field]: parent || payload[currentPrimaryKeyField],
					});
				}

				savedPrimaryKeys.push(
					...(await itemsService.upsertMany(recordsToUpsert, {
						onRevisionCreate: (id) => revisions.push(id),
					}))
				);

				const query: Query = {
					filter: {
						_and: [
							{
								[relation.field]: {
									_eq: parent,
								},
							},
							{
								[relatedPrimaryKeyField]: {
									_nin: savedPrimaryKeys,
								},
							},
						],
					},
				};

				// Nullify all related items that aren't included in the current payload
				if (relation.meta.one_deselect_action === 'delete') {
					// There's no revision for a deletion
					await itemsService.deleteByQuery(query);
				} else {
					await itemsService.updateByQuery(
						query,
						{ [relation.field]: null },
						{
							onRevisionCreate: (id) => revisions.push(id),
						}
					);
				}
			}
			// "Updates" object w/ create/update/delete
			else {
				const alterations = payload[relation.meta!.one_field!] as Alterations;
				const { error } = nestedUpdateSchema.validate(alterations);
				if (error) throw new InvalidPayloadException(`Invalid one-to-many update structure: ${error.message}`);

				if (alterations.create) {
					await itemsService.createMany(
						alterations.create.map((item) => ({
							...item,
							[relation.field]: parent || payload[currentPrimaryKeyField],
						})),
						{
							onRevisionCreate: (id) => revisions.push(id),
						}
					);
				}

				if (alterations.update) {
					const primaryKeyField = this.schema.collections[relation.collection].primary;

					for (const item of alterations.update) {
						await itemsService.updateOne(
							item[primaryKeyField],
							{
								...item,
								[relation.field]: parent || payload[currentPrimaryKeyField],
							},
							{
								onRevisionCreate: (id) => revisions.push(id),
							}
						);
					}
				}

				if (alterations.delete) {
					const query: Query = {
						filter: {
							_and: [
								{
									[relation.field]: {
										_eq: parent,
									},
								},
								{
									[relatedPrimaryKeyField]: {
										_in: alterations.delete,
									},
								},
							],
						},
					};

					if (relation.meta.one_deselect_action === 'delete') {
						await itemsService.deleteByQuery(query);
					} else {
						await itemsService.updateByQuery(
							query,
							{ [relation.field]: null },
							{
								onRevisionCreate: (id) => revisions.push(id),
							}
						);
					}
				}
			}
		}

		return { revisions };
	}
}
