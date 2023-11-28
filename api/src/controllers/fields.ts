import { TYPES } from '@directus/constants';
import { isDirectusError } from '@directus/errors';
import type { Field, FieldRaw, Type } from '@directus/types';
import { Router } from 'express';
import Joi from 'joi';
import { ALIAS_TYPES } from '../constants.js';
import { ErrorCode, InvalidPayloadError } from '@directus/errors';
import validateCollection from '../middleware/collection-exists.js';
import { respond } from '../middleware/respond.js';
import useCollection from '../middleware/use-collection.js';
import { FieldsService } from '../services/fields.js';
import asyncHandler from '../utils/async-handler.js';
import logger from '../logger.js';
import { isEqual } from 'lodash-es';
import getDatabase from '../database/index.js';
import { inspect } from 'node:util';

const router = Router();

router.use(useCollection('directus_fields'));

router.get(
	'/',
	asyncHandler(async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const fields = await service.readAll();

		res.locals['payload'] = { data: fields || null };
		return next();
	}),
	respond,
);

router.get(
	'/:collection',
	validateCollection,
	asyncHandler(async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const fields = await service.readAll(req.params['collection']);

		res.locals['payload'] = { data: fields || null };
		return next();
	}),
	respond,
);

router.get(
	'/:collection/:field',
	validateCollection,
	asyncHandler(async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const field = await service.readOne(req.params['collection']!, req.params['field']!);

		res.locals['payload'] = { data: field || null };
		return next();
	}),
	respond,
);

const newFieldSchema = Joi.object({
	collection: Joi.string().optional(),
	field: Joi.string().required(),
	type: Joi.string()
		.valid(...TYPES, ...ALIAS_TYPES)
		.allow(null)
		.optional(),
	schema: Joi.object({
		default_value: Joi.any(),
		max_length: [Joi.number(), Joi.string(), Joi.valid(null)],
		is_nullable: Joi.bool(),
	})
		.unknown()
		.allow(null),
	meta: Joi.any(),
});

router.post(
	'/:collection',
	validateCollection,
	asyncHandler(async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const { error } = newFieldSchema.validate(req.body);

		if (error) {
			throw new InvalidPayloadError({ reason: error.message });
		}

		const field: Partial<Field> & { field: string; type: Type | null } = req.body;

		await service.createField(req.params['collection']!, field);

		try {
			const createdField = await service.readOne(req.params['collection']!, field.field);
			res.locals['payload'] = { data: createdField || null };
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
	'/:collection',
	validateCollection,
	asyncHandler(async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		if (Array.isArray(req.body) === false) {
			throw new InvalidPayloadError({ reason: 'Submitted body has to be an array' });
		}

		let start = Date.now();
		logger.trace('[fields-benchmark] Starting batch update of fields');

		// Compare the fields to update with the fields in the database
		let onlyUpdatingSort = true;

		try {
			const fieldsToUpdate = [... new Set(req.body.map((field: FieldRaw) => field.field))];
			const currentFields = await Promise.all(fieldsToUpdate.map((field) => service.readOne(req.params['collection']!, field as string)));

			for (const currentField of currentFields) {
				const fieldToUpdate = req.body.find((f: FieldRaw) => f.field === currentField['field']);
				
				const attributesChanged = getChangedAttributes(fieldToUpdate, currentField as Field);

				if ((attributesChanged.length === 1 && attributesChanged[0] !== 'meta.sort') || attributesChanged.length > 1) {
					logger.debug(`[fields-benchmark] Field ${currentField['field']} has changed attributes ${attributesChanged.join(', ')}`);
					logger.trace(`[fields-benchmark] lhs = ${inspect(fieldToUpdate)}, rhs = ${inspect(currentField)}`);
					onlyUpdatingSort = false;
					break;
				}
			}
		} catch (error: any) {
			logger.error("[fields-benchmark] Error in fasttracking logic, falling back to normal update");
			logger.error(error);
			onlyUpdatingSort = false;
		}

		logger.debug(`[fields-benchmark] Preliminary read of fields took ${Date.now() - start}ms`);
		start = Date.now();

		// If we are only updating sort, we can fasttrack the update
		if (onlyUpdatingSort && req.accountability?.admin) {
			logger.debug("[fields-benchmark] Only updating sort, fasttracking update");
			// For each field, set the sort column to its new value
			const knex = getDatabase();

			await knex.transaction(async (trx) => {
				for (const field of req.body) {
					await trx('directus_fields')
						.where({
							collection: req.params['collection'],
							field: field.field,
						})
						.update({ sort: field.meta.sort });
				}
			});
		} else {
			logger.debug("[fields-benchmark] Updating fields normally");

			for (const field of req.body) {
				await service.updateField(req.params['collection']!, field);
			}
		}

		logger.trace(`[fields-benchmark] Batch update of fields took ${Date.now() - start}ms`);

		start = Date.now();
		logger.trace('[fields-benchmark] Starting batch read of fields');

		try {
			const results: any = [];

			for (const field of req.body) {
				const updatedField = await service.readOne(req.params['collection']!, field.field);
				results.push(updatedField);
				res.locals['payload'] = { data: results || null };
			}
		} catch (error: any) {
			if (isDirectusError(error, ErrorCode.Forbidden)) {
				return next();
			}

			throw error;
		}

		logger.trace(`[fields-benchmark] Batch read of fields took ${Date.now() - start}ms`);

		return next();
	}),
	respond,
);

const updateSchema = Joi.object({
	type: Joi.string()
		.valid(...TYPES, ...ALIAS_TYPES)
		.allow(null),
	schema: Joi.object({
		default_value: Joi.any(),
		max_length: [Joi.number(), Joi.string(), Joi.valid(null)],
		is_nullable: Joi.bool(),
	})
		.unknown()
		.allow(null),
	meta: Joi.any(),
}).unknown();

router.patch(
	'/:collection/:field',
	validateCollection,
	asyncHandler(async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const { error } = updateSchema.validate(req.body);

		if (error) {
			throw new InvalidPayloadError({ reason: error.message });
		}

		if (req.body.schema && !req.body.type) {
			throw new InvalidPayloadError({ reason: `You need to provide "type" when providing "schema"` });
		}

		const fieldData: Partial<Field> & { field: string; type: Type } = req.body;

		if (!fieldData.field) fieldData.field = req.params['field']!;

		await service.updateField(req.params['collection']!, fieldData);

		try {
			const updatedField = await service.readOne(req.params['collection']!, req.params['field']!);
			res.locals['payload'] = { data: updatedField || null };
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
	'/:collection/:field',
	validateCollection,
	asyncHandler(async (req, _res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		await service.deleteField(req.params['collection']!, req.params['field']!);
		return next();
	}),
	respond,
);

// Logic for getting the changed attributes of fields
function getChangedAttributes(fieldFromBody: FieldRaw, currentField: Field) {
	const changedFields = [];

	// Top-level attributes other than schema and meta must match
	for (const attr in fieldFromBody) {
		if (Object.prototype.hasOwnProperty.call(fieldFromBody, attr)) {
			if (attr !== 'schema' && attr !== 'meta' && !isEqual((fieldFromBody as any)[attr], (currentField as any)[attr])) {
				changedFields.push(attr);
			}
		}
	}

	// All attributes in schema must match (if schema is present)
	if (fieldFromBody.schema) {
		if (!isEqual(fieldFromBody.schema, currentField.schema)) changedFields.push('schema');
	}

	// All attributes in meta must match (but some may be missing)
	for (const attr in fieldFromBody.meta) {
		if (Object.prototype.hasOwnProperty.call(fieldFromBody, attr)) {
			if (!isEqual((fieldFromBody.meta as any)[attr], (currentField.meta as any)[attr])) {
				changedFields.push(`meta.${attr}`);
			}
		}
	}

	return changedFields;
}

export default router;
