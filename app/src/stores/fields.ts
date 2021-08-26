import api from '@/api';
import { i18n } from '@/lang';
import { useRelationsStore } from '@/stores/';
import { Relation } from '@/types';
import { notEmpty } from '@/utils/is-empty/';
import { unexpectedError } from '@/utils/unexpected-error';
import formatTitle from '@directus/format-title';
import { DeepPartial, Field, FieldRaw } from '@directus/shared/types';
import { parseFilter } from '@/utils/parse-filter';
import { merge, orderBy } from 'lodash';
import { nanoid } from 'nanoid';
import { defineStore } from 'pinia';

/**
 * directus_files is a special case. For it to play nice with interfaces/layouts/displays, we need
 * to treat the actual image thumbnail as a separate available field, instead of part of the regular
 * item (normally all file related info is nested within a separate column). This allows layouts to
 * render out files as it if were a "normal" collection, where the actual file is a fake m2o to
 * itself.
 */
const fakeFilesField: Field = {
	collection: 'directus_files',
	field: '$thumbnail',
	schema: null,
	name: '$thumbnail',
	type: 'integer',
	meta: {
		id: -1,
		collection: 'directus_files',
		field: '$thumbnail',
		sort: null,
		special: null,
		interface: null,
		options: null,
		display: 'file',
		display_options: null,
		hidden: false,
		translations: null,
		readonly: true,
		width: 'full',
		group: null,
		note: null,
		required: false,
		conditions: null,
	},
};

/**
 * @NOTE
 * This keeps track of what update is the last one that's in progress. After every update, the store
 * gets flushed with the updated values, which means that you can have racing conditions if you do
 * multiple updates at the same time. By keeping track which one is the last one that's fired, we
 * can ensure that only the last update gets used to flush the store with.
 */
let currentUpdate: string;

export const useFieldsStore = defineStore({
	id: 'fieldsStore',
	state: () => ({
		fields: [] as Field[],
	}),
	actions: {
		async hydrate() {
			const fieldsResponse = await api.get(`/fields`, { params: { limit: -1 } });

			const fields: FieldRaw[] = fieldsResponse.data.data;

			this.fields = [...fields.map(this.parseField), fakeFilesField];

			this.translateFields();
		},
		async dehydrate() {
			this.$reset();
		},
		parseField(field: FieldRaw): Field {
			const name = formatTitle(field.field);

			if (field.meta && notEmpty(field.meta.translations) && field.meta.translations.length > 0) {
				for (let i = 0; i < field.meta.translations.length; i++) {
					const { language, translation } = field.meta.translations[i];

					i18n.global.mergeLocaleMessage(language, {
						fields: {
							[field.collection]: {
								[field.field]: translation,
							},
						},
					});
				}
			}

			if (field.meta?.conditions) {
				field.meta.conditions = field.meta.conditions.map((condition) => ({
					...condition,
					rule: parseFilter(condition.rule),
				}));
			}

			return {
				...field,
				name,
			};
		},
		translateFields() {
			this.fields = this.fields.map((field) => {
				let name: string;

				if (i18n.global.te(`fields.${field.collection}.${field.field}`)) {
					name = i18n.global.t(`fields.${field.collection}.${field.field}`);
				} else {
					name = formatTitle(field.field);
				}

				return {
					...field,
					name,
				};
			});
		},
		async createField(collectionKey: string, newField: Field) {
			const stateClone = [...this.fields];

			// Update locally first, so the changes are visible immediately
			this.fields = [...this.fields, newField];

			// Save to API, and update local state again to make sure everything is in sync with the
			// API
			try {
				const response = await api.post(`/fields/${collectionKey}`, newField);

				const field = this.parseField(response.data.data);

				this.fields = this.fields.map((field) => {
					if (field.collection === collectionKey && field.field === newField.field) {
						return field;
					}

					return field;
				});

				return field;
			} catch (err) {
				// reset the changes if the api sync failed
				this.fields = stateClone;
				unexpectedError(err);
			}
		},
		async updateField(collectionKey: string, fieldKey: string, updates: Record<string, Partial<Field>>) {
			const stateClone = [...this.fields];

			// Update locally first, so the changes are visible immediately
			this.fields = this.fields.map((field) => {
				if (field.collection === collectionKey && field.field === fieldKey) {
					return merge({}, field, updates);
				}

				return field;
			});

			// Save to API, and update local state again to make sure everything is in sync with the
			// API
			try {
				const response = await api.patch(`/fields/${collectionKey}/${fieldKey}`, updates);

				this.fields = this.fields.map((field) => {
					if (field.collection === collectionKey && field.field === fieldKey) {
						return this.parseField(response.data.data);
					}

					return field;
				});
			} catch (err) {
				// reset the changes if the api sync failed
				this.fields = stateClone;
				unexpectedError(err);
			}
		},
		async updateFields(collectionKey: string, updates: DeepPartial<Field>[]) {
			const updateID = nanoid();
			const stateClone = [...this.fields];

			currentUpdate = updateID;

			// Update locally first, so the changes are visible immediately
			this.fields = this.fields.map((field) => {
				if (field.collection === collectionKey) {
					const updatesForThisField = updates.find((update) => update.field === field.field);

					if (updatesForThisField) {
						return merge({}, field, updatesForThisField);
					}
				}

				return field;
			});

			try {
				// Save to API, and update local state again to make sure everything is in sync with the
				// API
				const response = await api.patch(`/fields/${collectionKey}`, updates);

				if (currentUpdate === updateID) {
					this.fields = this.fields.map((field) => {
						if (field.collection === collectionKey) {
							const newDataForField = response.data.data.find((update: Field) => update.field === field.field);
							if (newDataForField) return this.parseField(newDataForField);
						}

						return field;
					});

					this.translateFields();
				}
			} catch (err) {
				// reset the changes if the api sync failed
				this.fields = stateClone;
				unexpectedError(err);
			}
		},
		async deleteField(collectionKey: string, fieldKey: string) {
			const stateClone = [...this.fields];

			this.fields = this.fields.filter((field) => {
				if (field.field === fieldKey && field.collection === collectionKey) return false;
				return true;
			});

			try {
				await api.delete(`/fields/${collectionKey}/${fieldKey}`);
			} catch (err) {
				this.fields = stateClone;
				unexpectedError(err);
			}
		},
		getPrimaryKeyFieldForCollection(collection: string): Field {
			/** @NOTE it's safe to assume every collection has a primary key */
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const primaryKeyField = this.fields.find(
				(field) => field.collection === collection && field.schema?.is_primary_key === true
			)!;

			return primaryKeyField;
		},
		getFieldsForCollection(collection: string): Field[] {
			return orderBy(
				this.fields.filter((field) => field.collection === collection),
				(collection) => (collection.meta?.sort ? Number(collection.meta?.sort) : null)
			);
		},
		getFieldsForCollectionAlphabetical(collection: string): Field[] {
			return this.getFieldsForCollection(collection).sort((a: Field, b: Field) => {
				if (a.field < b.field) return -1;
				else if (a.field > b.field) return 1;
				else return 1;
			});
		},
		/**
		 * Retrieve field info for a field or a related field
		 */
		getField(collection: string, fieldKey: string): Field | null {
			if (fieldKey.includes('.')) {
				return this.getRelationalField(collection, fieldKey) || null;
			} else {
				return this.fields.find((field) => field.collection === collection && field.field === fieldKey) || null;
			}
		},
		/**
		 * Retrieve field info for a (deeply) nested field
		 * Recursively searches through the relationships to find the field info that matches the
		 * dot notation.
		 */
		getRelationalField(collection: string, fields: string) {
			const relationsStore = useRelationsStore();
			const parts = fields.split('.');

			const relation = relationsStore
				.getRelationsForField(collection, parts[0])
				?.find(
					(relation: Relation) => relation.field === parts[0] || relation.meta?.one_field === parts[0]
				) as Relation;

			if (relation === undefined) return false;

			const relatedCollection = relation.field === parts[0] ? relation.related_collection : relation.collection;
			parts.shift();
			const relatedField = parts.join('.');
			return this.getField(relatedCollection, relatedField);
		},
	},
});
