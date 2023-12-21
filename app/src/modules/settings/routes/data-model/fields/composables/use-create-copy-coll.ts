import { Ref, ref, watch } from 'vue';
import { useFieldsStore } from '@/stores/fields';
import { useRelationsStore } from '@/stores/relations';
import { useCollectionsStore } from '@/stores/collections';
import api from '@/api';
import { Field, Relation } from '@directus/types';
import { notify } from '@/utils/notify';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { unexpectedError } from '@/utils/unexpected-error';

// LOGIC TO CREATE A COLLECTION COPY

// if a collections contains one of these relations, then copy ability is disabled
const restrictedRelations = ['m2o', 'm2m', 'm2a', 'translations', 'file', 'files', 'alias', 'o2a'];

export function useCreateCopyCollection(
	parentCollName: Ref<string>,
	item: Ref<Record<string, any> | null>,
	edits: Ref<Record<string, any>>,
) {
	const fieldsStore = useFieldsStore();
	const relationsStore = useRelationsStore();
	const collectionsStore = useCollectionsStore();

	const { t } = useI18n();

	const router = useRouter();

	const confirmCopy = ref(false);
	const copyName = ref<null | string>(null);
	const savingCopy = ref(false);
	const isCopyBtnDisabled = ref(false);

	watch(
		fieldsStore,
		() => {
			const collsFields = fieldsStore.getFieldsForCollection(parentCollName.value);

			const isContainRestrictedRelation = collsFields.some(
				(f) => f.meta!.special?.some((rel) => restrictedRelations.includes(rel)),
			);

			if (isContainRestrictedRelation) {
				isCopyBtnDisabled.value = true;
			} else {
				isCopyBtnDisabled.value = false;
			}
		},
		{ immediate: true },
	);

	return { confirmCopy, copyName, savingCopy, isCopyBtnDisabled, createCopy, onCopyCancel };

	async function createCopy() {
		try {
			savingCopy.value = true;

			// get the fields for copy from the parent collection
			const fieldsForCopy = fieldsStore.getFieldsForCollection(parentCollName.value);

			// @ts-ignore
			fieldsForCopy.forEach((f) => delete f.meta!.id);

			// create copy collection
			const { data } = await api.post('/collections', {
				schema: item.value!.schema,
				meta: {
					...item.value!.meta,
					...(edits.value.meta ?? {}),
				},
				fields: fieldsForCopy,
				collection: copyName.value,
			});

			const copyCollName: string = data.data.collection;

			const storeHydrations: Promise<void>[] = [];

			// set system relations
			const relations = getSystemRelations(fieldsForCopy, copyCollName);

			if (relations.length > 0) {
				const requests = relations.map((relation) => api.post('/relations', relation));
				await Promise.all(requests);
				storeHydrations.push(relationsStore.hydrate());
			}

			storeHydrations.push(collectionsStore.hydrate(), fieldsStore.hydrate());
			await Promise.all(storeHydrations);

			notify({
				title: t('Copy Created'),
			});

			edits.value = {};

			// do this so that the copy is fetched and refreshed and user can see all data up to date
			router.replace(`/settings/data-model`);
			let timeout = null;

			timeout = setTimeout(() => {
				router.replace(`/settings/data-model/${copyCollName}`);
				timeout = null;
			});
		} catch (err) {
			unexpectedError(err);
		} finally {
			confirmCopy.value = false;
			copyName.value = null;
			savingCopy.value = false;
		}
	}

	function getSystemRelations(fields: Field[], copyCollName: string) {
		const relations: Partial<Relation>[] = [];

		const userCreatedField = fields.find((f) => f.meta?.special?.includes('user-created'));
		const userUpdatedField = fields.find((f) => f.meta?.special?.includes('user-updated'));

		if (userCreatedField) {
			relations.push({
				collection: copyCollName,
				field: userCreatedField.field,
				related_collection: 'directus_users',
				schema: {},
			});
		}

		if (userUpdatedField) {
			relations.push({
				collection: copyCollName,
				field: userUpdatedField.field,
				related_collection: 'directus_users',
				schema: {},
			});
		}

		return relations;
	}

	function onCopyCancel() {
		confirmCopy.value = false;
		copyName.value = null;
	}
}
