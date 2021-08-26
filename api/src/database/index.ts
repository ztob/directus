import SchemaInspector from '@directus/schema';
import { knex, Knex } from 'knex';
import { performance } from 'perf_hooks';
import env from '../env';
import logger from '../logger';
import { getConfigFromEnv } from '../utils/get-config-from-env';
import { validateEnv } from '../utils/validate-env';
import fse from 'fs-extra';
import path from 'path';
import { merge } from 'lodash';

let database: Knex | null = null;
let inspector: ReturnType<typeof SchemaInspector> | null = null;

export default function getDatabase(): Knex {
	if (database) {
		return database;
	}

	const connectionConfig: Record<string, any> = getConfigFromEnv('DB_', [
		'DB_CLIENT',
		'DB_SEARCH_PATH',
		'DB_CONNECTION_STRING',
		'DB_POOL',
	]);

	const poolConfig = getConfigFromEnv('DB_POOL');

	const requiredEnvVars = ['DB_CLIENT'];

	if (env.DB_CLIENT && env.DB_CLIENT === 'sqlite3') {
		requiredEnvVars.push('DB_FILENAME');
	} else if (env.DB_CLIENT && env.DB_CLIENT === 'oracledb') {
		if (!env.DB_CONNECT_STRING) {
			requiredEnvVars.push('DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD');
		} else {
			requiredEnvVars.push('DB_USER', 'DB_PASSWORD', 'DB_CONNECT_STRING');
		}
	} else {
		if (env.DB_CLIENT === 'pg') {
			if (!env.DB_CONNECTION_STRING) {
				requiredEnvVars.push('DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USER');
			}
		} else {
			requiredEnvVars.push('DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD');
		}
	}

	validateEnv(requiredEnvVars);

	const knexConfig: Knex.Config = {
		client: env.DB_CLIENT,
		searchPath: env.DB_SEARCH_PATH,
		connection: env.DB_CONNECTION_STRING || connectionConfig,
		log: {
			warn: (msg) => {
				if (msg.startsWith('.returning()')) return;
				return logger.warn(msg);
			},
			error: (msg) => logger.error(msg),
			deprecate: (msg) => logger.info(msg),
			debug: (msg) => logger.debug(msg),
		},
		pool: poolConfig,
	};

	if (env.DB_CLIENT === 'sqlite3') {
		knexConfig.useNullAsDefault = true;
		poolConfig.afterCreate = (conn: any, cb: any) => {
			conn.run('PRAGMA foreign_keys = ON', cb);
		};
	}

	if (env.DB_CLIENT === 'mssql') {
		// This brings MS SQL in line with the other DB vendors. We shouldn't do any automatic
		// timezone conversion on the database level, especially not when other database vendors don't
		// act the same
		merge(knexConfig, { connection: { options: { useUTC: false } } });
	}

	database = knex(knexConfig);

	const times: Record<string, number> = {};

	database
		.on('query', (queryInfo) => {
			times[queryInfo.__knexUid] = performance.now();
		})
		.on('query-response', (response, queryInfo) => {
			const delta = performance.now() - times[queryInfo.__knexUid];
			logger.trace(`[${delta.toFixed(3)}ms] ${queryInfo.sql} [${queryInfo.bindings.join(', ')}]`);
			delete times[queryInfo.__knexUid];
		});

	return database;
}

export function getSchemaInspector(): ReturnType<typeof SchemaInspector> {
	if (inspector) {
		return inspector;
	}

	const database = getDatabase();

	inspector = SchemaInspector(database);

	return inspector;
}

export async function hasDatabaseConnection(database?: Knex): Promise<boolean> {
	database = database ?? getDatabase();

	try {
		if (env.DB_CLIENT === 'oracledb') {
			await database.raw('select 1 from DUAL');
		} else {
			await database.raw('SELECT 1');
		}

		return true;
	} catch {
		return false;
	}
}

export async function validateDBConnection(database?: Knex): Promise<void> {
	database = database ?? getDatabase();

	try {
		if (env.DB_CLIENT === 'oracledb') {
			await database.raw('select 1 from DUAL');
		} else {
			await database.raw('SELECT 1');
		}
	} catch (error) {
		logger.error(`Can't connect to the database.`);
		logger.error(error);
		process.exit(1);
	}
}

export async function isInstalled(): Promise<boolean> {
	const inspector = getSchemaInspector();

	// The existence of a directus_collections table alone isn't a "proper" check to see if everything
	// is installed correctly of course, but it's safe enough to assume that this collection only
	// exists when using the installer CLI.
	return await inspector.hasTable('directus_collections');
}

export async function validateMigrations(): Promise<boolean> {
	const database = getDatabase();

	try {
		let migrationFiles = await fse.readdir(path.join(__dirname, 'migrations'));

		const customMigrationsPath = path.resolve(env.EXTENSIONS_PATH, 'migrations');

		let customMigrationFiles =
			((await fse.pathExists(customMigrationsPath)) && (await fse.readdir(customMigrationsPath))) || [];

		migrationFiles = migrationFiles.filter(
			(file: string) => file.startsWith('run') === false && file.endsWith('.d.ts') === false
		);

		customMigrationFiles = customMigrationFiles.filter((file: string) => file.endsWith('.js'));

		migrationFiles.push(...customMigrationFiles);

		const requiredVersions = migrationFiles.map((filePath) => filePath.split('-')[0]);
		const completedVersions = (await database.select('version').from('directus_migrations')).map(
			({ version }) => version
		);

		return requiredVersions.every((version) => completedVersions.includes(version));
	} catch (error) {
		logger.error(`Database migrations cannot be found`);
		logger.error(error);
		throw process.exit(1);
	}
}
