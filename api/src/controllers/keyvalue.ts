import express from 'express';
import { validateBatch } from '../middleware/validate-batch.js';
import { respond } from '../middleware/respond.js';
import asyncHandler from '../utils/async-handler.js';
import useCollection from '../middleware/use-collection.js';
import { KeyValueService } from '../services/keyvalue.js';
import { MetaService } from '../services/meta.js';
import type { PrimaryKey } from '../types/index.js';
import { isDirectusError } from '@directus/errors';
import { ErrorCode } from '@directus/errors';
import { sanitizeQuery } from '../utils/sanitize-query.js';
import type { Query } from '@directus/types';

const router = express.Router();
router.use(useCollection('directus_keyvalue'));

function filterItemsByCurrentUser(query: Query, userId: string) {
	const filter = query.filter;
	// eslint-disable-next-line no-nested-ternary
	const filterType = filter ? ('_and' in filter ? '_and' : '_or' in filter ? '_or' : null) : null;

	return {
		...query,
		filter: {
			[filterType ?? '_and']: [
				...(filter && filterType ? ((filter  as Record<string, any>)[filterType]) : []),
				{
					user_created: {
						_eq: userId,
					},
				},
			],
		},
	};
}

const readHandler = asyncHandler(async (req, res, next) => {
	const typeRequest = req.query['mode'] ?? null // 'usage'

	const service = new KeyValueService({
		accountability: req.accountability,
		schema: req.schema,
	});

	const metaService = new MetaService({
		accountability: req.accountability,
		schema: req.schema,
	});

	const query: Record<string, any> = (req.accountability?.admin && !typeRequest)
	? req.sanitizedQuery
	: filterItemsByCurrentUser(req.sanitizedQuery, req.accountability?.user as string)

	const records = await service.readByQuery(query);
	const meta = await metaService.getMetaForQuery(req.collection, query);

	res.locals['payload'] = { data: records || null, meta };
	return next();
});

router.get('/', validateBatch('read'), readHandler, respond);
router.search('/', validateBatch('read'), readHandler, respond);

router.get(
	'/:pk',
	asyncHandler(async (req, res, next) => {
		const service = new KeyValueService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const query: Record<string, any> = req.accountability?.admin
		? req.sanitizedQuery
		: filterItemsByCurrentUser(req.sanitizedQuery, req.accountability?.user as string)

		const record = await service.readOne(req.params['pk']!, query);

		res.locals['payload'] = { data: record || null };

		return next();
	}),
	respond,
);

router.post(
	'/',
	asyncHandler(async (req, res, next) => {
		const service = new KeyValueService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const savedKeys: PrimaryKey[] = [];

		if (Array.isArray(req.body)) {
			const keys = await service.createMany(req.body);
			savedKeys.push(...keys);
		} else {
			const key = await service.createOne(req.body);
			savedKeys.push(key);
		}

		try {
			if (Array.isArray(req.body)) {
				const items = await service.readMany(savedKeys, req.sanitizedQuery);
				res.locals['payload'] = { data: items };
			} else {
				const item = await service.readOne(savedKeys[0]!, req.sanitizedQuery);
				res.locals['payload'] = { data: item };
			}
		} catch (error: any) {
			if (isDirectusError(error, ErrorCode.Forbidden)) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond,
);

router.patch(
	'/',
	validateBatch('update'),
	asyncHandler(async (req, res, next) => {
		const service = new KeyValueService({
			accountability: req.accountability,
			schema: req.schema,
		});

		let keys: PrimaryKey[] = [];

		if (req.body.keys) {
			keys = await service.updateMany(req.body.keys, req.body.data);
		} else {
			const sanitizedQuery = sanitizeQuery(req.body.query, req.accountability);
			keys = await service.updateByQuery(sanitizedQuery, req.body.data);
		}

		try {
			const result = await service.readMany(keys, req.sanitizedQuery);
			res.locals['payload'] = { data: result };
		} catch (error: any) {
			if (isDirectusError(error, ErrorCode.Forbidden)) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond,
);

router.patch(
	'/:pk',
	asyncHandler(async (req, res, next) => {
		const service = new KeyValueService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const primaryKey = await service.updateOne(req.params['pk']!, req.body);

		try {
			const item = await service.readOne(primaryKey, req.sanitizedQuery);
			res.locals['payload'] = { data: item || null };
		} catch (error: any) {
			if (isDirectusError(error, ErrorCode.Forbidden)) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond,
);

router.delete(
	'/',
	asyncHandler(async (req, _res, next) => {
		const service = new KeyValueService({
			accountability: req.accountability,
			schema: req.schema,
		});

		if (Array.isArray(req.body)) {
			await service.deleteMany(req.body);
		} else if (req.body.keys) {
			await service.deleteMany(req.body.keys);
		} else {
			const sanitizedQuery = sanitizeQuery(req.body.query, req.accountability);
			await service.deleteByQuery(sanitizedQuery);
		}

		return next();
	}),
	respond,
);

router.delete(
	'/:pk',
	asyncHandler(async (req, _res, next) => {
		const service = new KeyValueService({
			accountability: req.accountability,
			schema: req.schema,
		});

		await service.deleteOne(req.params['pk']!);

		return next();
	}),
	respond,
);

export default router;
