import argon2 from 'argon2';
import { Router } from 'express';
import Joi from 'joi';
import { nanoid } from 'nanoid';
import { ForbiddenException, InvalidPayloadException, InvalidQueryException } from '../exceptions';
import collectionExists from '../middleware/collection-exists';
import { respond } from '../middleware/respond';
import { RevisionsService, UtilsService, ImportService } from '../services';
import asyncHandler from '../utils/async-handler';
import Busboy from 'busboy';
import { getCache } from '../cache';

const router = Router();

router.get(
	'/random/string',
	asyncHandler(async (req, res) => {
		if (req.query && req.query.length && Number(req.query.length) > 500)
			throw new InvalidQueryException(`"length" can't be more than 500 characters`);

		const string = nanoid(req.query?.length ? Number(req.query.length) : 32);

		return res.json({ data: string });
	})
);

router.post(
	'/hash/generate',
	asyncHandler(async (req, res) => {
		if (!req.body?.string) {
			throw new InvalidPayloadException(`"string" is required`);
		}

		const hash = await argon2.hash(req.body.string);

		return res.json({ data: hash });
	})
);

router.post(
	'/hash/verify',
	asyncHandler(async (req, res) => {
		if (!req.body?.string) {
			throw new InvalidPayloadException(`"string" is required`);
		}

		if (!req.body?.hash) {
			throw new InvalidPayloadException(`"hash" is required`);
		}

		const result = await argon2.verify(req.body.hash, req.body.string);

		return res.json({ data: result });
	})
);

const SortSchema = Joi.object({
	item: Joi.alternatives(Joi.string(), Joi.number()).required(),
	to: Joi.alternatives(Joi.string(), Joi.number()).required(),
});

router.post(
	'/sort/:collection',
	collectionExists,
	asyncHandler(async (req, res) => {
		const { error } = SortSchema.validate(req.body);
		if (error) throw new InvalidPayloadException(error.message);

		const service = new UtilsService({
			accountability: req.accountability,
			schema: req.schema,
		});
		await service.sort(req.collection, req.body);

		return res.status(200).end();
	})
);

router.post(
	'/revert/:revision',
	asyncHandler(async (req, res, next) => {
		const service = new RevisionsService({
			accountability: req.accountability,
			schema: req.schema,
		});
		await service.revert(req.params.revision);
		next();
	}),
	respond
);

router.post(
	'/import/:collection',
	collectionExists,
	asyncHandler(async (req, res, next) => {
		const service = new ImportService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const busboy = new Busboy({ headers: req.headers });

		busboy.on('file', async (fieldname, fileStream, filename, encoding, mimetype) => {
			try {
				await service.import(req.params.collection, mimetype, fileStream);
			} catch (err) {
				return next(err);
			}

			return res.status(200).end();
		});

		busboy.on('error', (err: Error) => next(err));

		req.pipe(busboy);
	})
);

router.post(
	'/cache/clear',
	asyncHandler(async (req, res) => {
		if (req.accountability?.admin !== true) {
			throw new ForbiddenException();
		}

		const { cache, schemaCache } = getCache();

		await cache?.clear();
		await schemaCache?.clear();

		res.status(200).end();
	})
);

export default router;
