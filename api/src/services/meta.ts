import { Knex } from 'knex';
import getDatabase from '../database';
import { ForbiddenException } from '../exceptions';
import { AbstractServiceOptions, SchemaOverview } from '../types';
import { Accountability } from '@directus/shared/types';
import { Query } from '../types/query';
import { applyFilter, applySearch } from '../utils/apply-query';
import { parseFilter } from '@directus/shared/utils';

export class MetaService {
	knex: Knex;
	accountability: Accountability | null;
	schema: SchemaOverview;

	constructor(options: AbstractServiceOptions) {
		this.knex = options.knex || getDatabase();
		this.accountability = options.accountability || null;
		this.schema = options.schema;
	}

	async getMetaForQuery(collection: string, query: Query): Promise<Record<string, any> | undefined> {
		if (!query || !query.meta) return;

		const results = await Promise.all(
			query.meta.map((metaVal) => {
				if (metaVal === 'total_count') return this.totalCount(collection);
				if (metaVal === 'filter_count') return this.filterCount(collection, query);
			})
		);

		return results.reduce((metaObject: Record<string, any>, value, index) => {
			return {
				...metaObject,
				[query.meta![index]]: value,
			};
		}, {});
	}

	async totalCount(collection: string): Promise<number> {
		const dbQuery = this.knex(collection).count('*', { as: 'count' }).first();

		if (this.accountability?.admin !== true) {
			const permissionsRecord = this.schema.permissions.find((permission) => {
				return permission.action === 'read' && permission.collection === collection;
			});

			if (!permissionsRecord) throw new ForbiddenException();

			const permissions = parseFilter(permissionsRecord.permissions, this.accountability);

			applyFilter(this.schema, dbQuery, permissions, collection);
		}

		const result = await dbQuery;

		return Number(result?.count ?? 0);
	}

	async filterCount(collection: string, query: Query): Promise<number> {
		const dbQuery = this.knex(collection).count('*', { as: 'count' });

		let filter = query.filter || {};

		if (this.accountability?.admin !== true) {
			const permissionsRecord = this.schema.permissions.find((permission) => {
				return permission.action === 'read' && permission.collection === collection;
			});

			if (!permissionsRecord) throw new ForbiddenException();

			const permissions = parseFilter(permissionsRecord.permissions, this.accountability);

			if (Object.keys(filter).length > 0) {
				filter = { _and: [permissions, filter] };
			} else {
				filter = permissions;
			}
		}

		if (Object.keys(filter).length > 0) {
			applyFilter(this.schema, dbQuery, filter, collection);
		}

		if (query.search) {
			applySearch(this.schema, dbQuery, query.search, collection);
		}

		const records = await dbQuery;

		return Number(records[0].count);
	}
}
