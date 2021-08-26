/**
 * Generate an AST based on a given collection and query
 */

import { Knex } from 'knex';
import { cloneDeep, mapKeys, omitBy } from 'lodash';
import { Accountability } from '@directus/shared/types';
import { AST, FieldNode, NestedCollectionNode, PermissionsAction, Query, SchemaOverview } from '../types';
import { getRelationType } from '../utils/get-relation-type';

type GetASTOptions = {
	accountability?: Accountability | null;
	action?: PermissionsAction;
	knex?: Knex;
};

type anyNested = {
	[collectionScope: string]: string[];
};

export default async function getASTFromQuery(
	collection: string,
	query: Query,
	schema: SchemaOverview,
	options?: GetASTOptions
): Promise<AST> {
	query = cloneDeep(query);

	const accountability = options?.accountability;
	const action = options?.action || 'read';

	const permissions =
		accountability && accountability.admin !== true
			? schema.permissions.filter((permission) => {
					return permission.action === action;
			  })
			: null;

	const ast: AST = {
		type: 'root',
		name: collection,
		query: query,
		children: [],
	};

	const fields = query.fields || ['*'];
	const deep = query.deep || {};

	// Prevent fields/deep from showing up in the query object in further use
	delete query.fields;
	delete query.deep;

	if (!query.sort) {
		const sortField = schema.collections[collection]?.sortField;
		query.sort = [{ column: sortField || schema.collections[collection].primary, order: 'asc' }];
	}

	ast.children = await parseFields(collection, fields, deep);

	return ast;

	async function parseFields(parentCollection: string, fields: string[] | null, deep?: Record<string, any>) {
		if (!fields) return [];

		fields = await convertWildcards(parentCollection, fields);

		if (!fields) return [];

		const children: (NestedCollectionNode | FieldNode)[] = [];

		const relationalStructure: Record<string, string[] | anyNested> = {};

		for (const field of fields) {
			const isRelational =
				field.includes('.') ||
				// We'll always treat top level o2m fields as a related item. This is an alias field, otherwise it won't return
				// anything
				!!schema.relations.find(
					(relation) => relation.related_collection === parentCollection && relation.meta?.one_field === field
				);

			if (isRelational) {
				// field is relational
				const parts = field.split('.');

				let fieldKey = parts[0];
				let collectionScope: string | null = null;

				// m2a related collection scoped field selector `fields=sections.section_id:headings.title`
				if (fieldKey.includes(':')) {
					const [key, scope] = fieldKey.split(':');
					fieldKey = key;
					collectionScope = scope;
				}

				if (fieldKey in relationalStructure === false) {
					if (collectionScope) {
						relationalStructure[fieldKey] = { [collectionScope]: [] };
					} else {
						relationalStructure[fieldKey] = [];
					}
				}

				if (parts.length > 1) {
					const childKey = parts.slice(1).join('.');

					if (collectionScope) {
						if (collectionScope in relationalStructure[fieldKey] === false) {
							(relationalStructure[fieldKey] as anyNested)[collectionScope] = [];
						}

						(relationalStructure[fieldKey] as anyNested)[collectionScope].push(childKey);
					} else {
						(relationalStructure[fieldKey] as string[]).push(childKey);
					}
				}
			} else {
				children.push({ type: 'field', name: field });
			}
		}

		for (const [relationalField, nestedFields] of Object.entries(relationalStructure)) {
			const relatedCollection = getRelatedCollection(parentCollection, relationalField);
			const relation = getRelation(parentCollection, relationalField);

			if (!relation) continue;

			const relationType = getRelationType({
				relation,
				collection: parentCollection,
				field: relationalField,
			});

			if (!relationType) continue;

			let child: NestedCollectionNode | null = null;

			if (relationType === 'm2a') {
				const allowedCollections = relation.meta!.one_allowed_collections!.filter((collection) => {
					if (!permissions) return true;
					return permissions.some((permission) => permission.collection === collection);
				});

				child = {
					type: 'm2a',
					names: allowedCollections,
					children: {},
					query: {},
					relatedKey: {},
					parentKey: schema.collections[parentCollection].primary,
					fieldKey: relationalField,
					relation: relation,
				};

				for (const relatedCollection of allowedCollections) {
					child.children[relatedCollection] = await parseFields(
						relatedCollection,
						Array.isArray(nestedFields) ? nestedFields : (nestedFields as anyNested)[relatedCollection] || ['*'],
						deep?.[`${relationalField}:${relatedCollection}`]
					);

					child.query[relatedCollection] = getDeepQuery(deep?.[`${relationalField}:${relatedCollection}`] || {});

					child.relatedKey[relatedCollection] = schema.collections[relatedCollection].primary;
				}
			} else if (relatedCollection) {
				if (permissions && permissions.some((permission) => permission.collection === relatedCollection) === false) {
					continue;
				}

				child = {
					type: relationType,
					name: relatedCollection,
					fieldKey: relationalField,
					parentKey: schema.collections[parentCollection].primary,
					relatedKey: schema.collections[relatedCollection].primary,
					relation: relation,
					query: getDeepQuery(deep?.[relationalField] || {}),
					children: await parseFields(relatedCollection, nestedFields as string[], deep?.[relationalField] || {}),
				};

				if (relationType === 'o2m' && !child!.query.sort) {
					child!.query.sort = [
						{ column: relation.meta?.sort_field || schema.collections[relation.collection].primary, order: 'asc' },
					];
				}
			}

			if (child) {
				children.push(child);
			}
		}

		return children;
	}

	async function convertWildcards(parentCollection: string, fields: string[]) {
		fields = cloneDeep(fields);

		const fieldsInCollection = Object.entries(schema.collections[parentCollection].fields).map(([name]) => name);

		let allowedFields: string[] | null = fieldsInCollection;

		if (permissions) {
			const permittedFields = permissions.find((permission) => parentCollection === permission.collection)?.fields;
			if (permittedFields !== undefined) allowedFields = permittedFields;
		}

		if (!allowedFields || allowedFields.length === 0) return [];

		// In case of full read permissions
		if (allowedFields[0] === '*') allowedFields = fieldsInCollection;

		for (let index = 0; index < fields.length; index++) {
			const fieldKey = fields[index];

			if (fieldKey.includes('*') === false) continue;

			if (fieldKey === '*') {
				// Set to all fields in collection
				if (allowedFields.includes('*')) {
					fields.splice(index, 1, ...fieldsInCollection);
				} else {
					// Set to all allowed fields
					fields.splice(index, 1, ...allowedFields);
				}
			}

			// Swap *.* case for *,<relational-field>.*,<another-relational>.*
			if (fieldKey.includes('.') && fieldKey.split('.')[0] === '*') {
				const parts = fieldKey.split('.');

				const relationalFields = allowedFields.includes('*')
					? schema.relations
							.filter(
								(relation) =>
									relation.collection === parentCollection || relation.related_collection === parentCollection
							)
							.map((relation) => {
								const isMany = relation.collection === parentCollection;
								return isMany ? relation.field : relation.meta?.one_field;
							})
					: allowedFields.filter((fieldKey) => !!getRelation(parentCollection, fieldKey));

				const nonRelationalFields = allowedFields.filter((fieldKey) => relationalFields.includes(fieldKey) === false);

				fields.splice(
					index,
					1,
					...[
						...relationalFields.map((relationalField) => {
							return `${relationalField}.${parts.slice(1).join('.')}`;
						}),
						...nonRelationalFields,
					]
				);
			}
		}

		return fields;
	}

	function getRelation(collection: string, field: string) {
		const relation = schema.relations.find((relation) => {
			return (
				(relation.collection === collection && relation.field === field) ||
				(relation.related_collection === collection && relation.meta?.one_field === field)
			);
		});

		return relation;
	}

	function getRelatedCollection(collection: string, field: string): string | null {
		const relation = getRelation(collection, field);

		if (!relation) return null;

		if (relation.collection === collection && relation.field === field) {
			return relation.related_collection || null;
		}

		if (relation.related_collection === collection && relation.meta?.one_field === field) {
			return relation.collection || null;
		}

		return null;
	}
}

function getDeepQuery(query: Record<string, any>) {
	return mapKeys(
		omitBy(query, (value, key) => key.startsWith('_') === false),
		(value, key) => key.substring(1)
	);
}
