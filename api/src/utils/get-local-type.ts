import { SchemaOverview } from '@directus/schema/dist/types/overview';
import { Column } from 'knex-schema-inspector/dist/types/column';
import { FieldMeta, Type } from '@directus/shared/types';
import getDatabase from '../database';

const localTypeMap: Record<string, { type: Type; useTimezone?: boolean }> = {
	// Shared
	boolean: { type: 'boolean' },
	tinyint: { type: 'boolean' },
	smallint: { type: 'integer' },
	mediumint: { type: 'integer' },
	int: { type: 'integer' },
	integer: { type: 'integer' },
	serial: { type: 'integer' },
	bigint: { type: 'bigInteger' },
	bigserial: { type: 'bigInteger' },
	clob: { type: 'text' },
	tinytext: { type: 'text' },
	mediumtext: { type: 'text' },
	longtext: { type: 'text' },
	text: { type: 'text' },
	varchar: { type: 'string' },
	longvarchar: { type: 'string' },
	varchar2: { type: 'string' },
	nvarchar: { type: 'string' },
	image: { type: 'binary' },
	ntext: { type: 'text' },
	char: { type: 'string' },
	date: { type: 'date' },
	datetime: { type: 'dateTime' },
	dateTime: { type: 'dateTime' },
	timestamp: { type: 'timestamp' },
	time: { type: 'time' },
	float: { type: 'float' },
	double: { type: 'float' },
	'double precision': { type: 'float' },
	real: { type: 'float' },
	decimal: { type: 'decimal' },
	numeric: { type: 'integer' },

	// MySQL
	string: { type: 'text' },
	year: { type: 'integer' },
	blob: { type: 'binary' },
	mediumblob: { type: 'binary' },
	'int unsigned': { type: 'integer' },

	// MS SQL
	bit: { type: 'boolean' },
	smallmoney: { type: 'float' },
	money: { type: 'float' },
	datetimeoffset: { type: 'timestamp', useTimezone: true },
	datetime2: { type: 'dateTime' },
	smalldatetime: { type: 'dateTime' },
	nchar: { type: 'text' },
	binary: { type: 'binary' },
	varbinary: { type: 'binary' },
	uniqueidentifier: { type: 'uuid' },

	// Postgres
	json: { type: 'json' },
	jsonb: { type: 'json' },
	uuid: { type: 'uuid' },
	int2: { type: 'integer' },
	serial4: { type: 'integer' },
	int4: { type: 'integer' },
	serial8: { type: 'integer' },
	int8: { type: 'integer' },
	bool: { type: 'boolean' },
	'character varying': { type: 'string' },
	character: { type: 'string' },
	interval: { type: 'string' },
	_varchar: { type: 'string' },
	bpchar: { type: 'string' },
	timestamptz: { type: 'timestamp' },
	'timestamp with time zone': { type: 'timestamp', useTimezone: true },
	'timestamp without time zone': { type: 'dateTime' },
	timetz: { type: 'time' },
	'time with time zone': { type: 'time', useTimezone: true },
	'time without time zone': { type: 'time' },
	float4: { type: 'float' },
	float8: { type: 'float' },

	// Oracle
	number: { type: 'integer' },

	// SQLite
	integerfirst: { type: 'integer' },
};

export default function getLocalType(
	column: SchemaOverview[string]['columns'][string] | Column,
	field?: { special?: FieldMeta['special'] }
): Type | 'unknown' {
	const database = getDatabase();

	const type = localTypeMap[column.data_type.toLowerCase().split('(')[0]];

	const special = field?.special;

	if (special) {
		if (special.includes('json')) return 'json';
		if (special.includes('hash')) return 'hash';
		if (special.includes('csv')) return 'csv';
		if (special.includes('uuid')) return 'uuid';
	}

	/** Handle OracleDB timestamp with time zone */
	if (database.client.constructor.name === 'Client_Oracledb' || database.client.constructor.name === 'Client_Oracle') {
		const type = column.data_type.toLowerCase();

		if (type.startsWith('timestamp')) {
			if (type.endsWith('with local time zone')) {
				return 'timestamp';
			} else {
				return 'dateTime';
			}
		}
	}

	/** Handle Postgres numeric decimals */
	if (column.data_type === 'numeric' && column.numeric_precision !== null && column.numeric_scale !== null) {
		return 'decimal';
	}

	/** Handle MS SQL varchar(MAX) (eg TEXT) types */
	if (column.data_type === 'nvarchar' && column.max_length === -1) {
		return 'text';
	}

	if (type) {
		return type.type;
	}

	return 'unknown';
}
