import type { AbstractSqlQuery } from '@directus/data-sql';
import type { ParameterizedSQLStatement } from '@directus/data-sql';
import { select } from './select.js';
import { from } from './from.js';
import { limit } from './limit.js';
import { offset } from './offset.js';
import { where } from './where.js';
import { orderBy } from './orderBy.js';

/**
 * Constructs an actual PostgreSQL query statement from a given abstract SQL query.
 *
 * @remarks
 * To create a PostgreSQL statement each part is constructed in a separate function.
 * In those functions it will be checked if the query part is actually needed.
 * If not, the functions return null.
 *
 * @param query - The abstract SQL statement
 * @returns An actual SQL query with parameters
 */
export function constructSqlQuery(query: AbstractSqlQuery): ParameterizedSQLStatement {
	const statementParts = [select, from, where, orderBy, limit, offset];

	const statement = `${statementParts
		.map((part) => part(query))
		.filter((p) => p !== null)
		.join(' ')};`;

	return {
		statement,
		parameters: query.parameters,
	};
}
