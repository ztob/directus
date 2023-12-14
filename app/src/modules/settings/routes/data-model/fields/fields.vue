<script setup lang="ts">
import { useEditsGuard } from '@/composables/use-edits-guard';
import { useItem } from '@/composables/use-item';
import { useShortcut } from '@/composables/use-shortcut';
import { useCollectionsStore } from '@/stores/collections';
import { useFieldsStore } from '@/stores/fields';
import { useCollection } from '@directus/composables';
import { computed, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import SettingsNavigation from '../../../components/navigation.vue';
import FieldsManagement from './components/fields-management.vue';
import formatTitle from '@directus/format-title';
import api from '@/api';
import { unexpectedError } from '@/utils/unexpected-error';
import { notify } from '@/utils/notify';
import { Relation } from '@directus/types';
import { useRelationsStore } from '@/stores/relations';

const props = defineProps<{
	collection: string;
	// Field detail modal only
	field?: string;
	type?: string;
}>();

const { t } = useI18n();

const router = useRouter();

const { collection } = toRefs(props);
const { info: collectionInfo, primaryKeyField } = useCollection(collection);
const collectionsStore = useCollectionsStore();
const fieldsStore = useFieldsStore();
const relationsStore = useRelationsStore();

const { edits, item, saving, loading, save, remove, deleting } = useItem(ref('directus_collections'), collection);

const hasEdits = computed<boolean>(() => {
	if (!edits.value.meta) return false;
	return Object.keys(edits.value.meta).length > 0;
});

useShortcut('meta+s', () => {
	if (hasEdits.value) saveAndStay();
});

const confirmDelete = ref(false);

const { confirmLeave, leaveTo } = useEditsGuard(hasEdits);

async function deleteAndQuit() {
	await remove();
	await Promise.all([collectionsStore.hydrate(), fieldsStore.hydrate()]);
	edits.value = {};
	router.replace(`/settings/data-model`);
}

async function saveAndStay() {
	await save();
	await Promise.all([collectionsStore.hydrate(), fieldsStore.hydrate()]);
}

async function saveAndQuit() {
	await save();
	await Promise.all([collectionsStore.hydrate(), fieldsStore.hydrate()]);
	router.push(`/settings/data-model`);
}

function discardAndLeave() {
	if (!leaveTo.value) return;
	edits.value = {};
	confirmLeave.value = false;
	router.push(leaveTo.value);
}

// LOGIC TO CREATE A COLLECTION COPY
const confirmCopy = ref(false);
const copyName = ref<null | string>(null);
const savingCopy = ref(false)
const isCopyBtnDisabled = ref(false)

// if a collections contains one of these relations, then copy ability is disabled
const restrictedRelations = ['m2o', 'm2m', 'm2a', 'translations', 'file', 'files', 'alias', 'o2a']

watch(fieldsStore, () => {
	const collsFields = fieldsStore.getFieldsForCollection(collectionInfo.value?.collection as string)
	const isContainRestrictedRelation = collsFields.some(f => f.meta!.special?.some(rel => restrictedRelations.includes(rel)))

	if(isContainRestrictedRelation) {
		isCopyBtnDisabled.value = true
	} else {
		isCopyBtnDisabled.value = false
	}
}, { immediate: true })

async function createCopy() {
	try {
		savingCopy.value = true

		// get the fields for copy from the parent collection
		const fieldsForCopy = fieldsStore.getFieldsForCollection(collectionInfo.value?.collection as string);

		// @ts-ignore
		fieldsForCopy.forEach(f => delete f.meta!.id)

		// create copy collection
		const { data } = await api.post('collections', {
			schema: item.value!.schema,
			meta: {
				...item.value!.meta,
				...(edits.value.meta ? edits.value.meta : {})
			},
			fields: fieldsForCopy,
			collection: copyName.value,
		})

		const copyCollName = data.data.collection

		const storeHydrations: Promise<void>[] = [];

		// set system relations
		const collCopyFields = fieldsForCopy.map(f => f.field)
		const relations = getSystemRelations(collCopyFields, copyCollName);

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

		edits.value = {}

		// do this so that the copy is fetched and refreshed and user can see all data up date
		router.replace(`/settings/data-model`);
		let timeout = null;

		timeout = setTimeout(() => {
			router.replace(`/settings/data-model/${copyCollName}`);
			timeout = null;
		})
	} catch (err) {
		unexpectedError(err);
	} finally {
		confirmCopy.value = false
		copyName.value = null
		savingCopy.value = false
	}
}

// function getPrimaryFieldForCopy(primaryKeyFieldType: string, primaryKeyFieldName: string) {
// 	if (primaryKeyFieldType === 'uuid') {
// 		return {
// 			field: primaryKeyFieldName,
// 			type: 'uuid',
// 			meta: {
// 				hidden: true,
// 				readonly: true,
// 				interface: 'input',
// 				special: ['uuid'],
// 			},
// 			schema: {
// 				is_primary_key: true,
// 				length: 36,
// 				has_auto_increment: false,
// 			},
// 		};
// 	} else if (primaryKeyFieldType === 'string') {
// 		return {
// 			field: primaryKeyFieldName,
// 			type: 'string',
// 			meta: {
// 				interface: 'input',
// 				readonly: false,
// 				hidden: false,
// 			},
// 			schema: {
// 				is_primary_key: true,
// 				length: 255,
// 				has_auto_increment: false,
// 			},
// 		};
// 	} else {
// 		return {
// 			field: primaryKeyFieldName,
// 			type: primaryKeyFieldType,
// 			meta: {
// 				hidden: true,
// 				interface: 'input',
// 				readonly: true,
// 			},
// 			schema: {
// 				is_primary_key: true,
// 				has_auto_increment: true,
// 			},
// 		};
// 	}
// }

function getSystemRelations(fields: string[], copyCollName: string) {
	const relations: Partial<Relation>[] = [];

	const userCreatedField = fields.find(f => f === 'user_created')
	const userUpdatedField = fields.find(f => f === 'user_updated')

	if (userCreatedField) {
		relations.push({
			collection: copyCollName,
			field: userCreatedField,
			related_collection: 'directus_users',
			schema: {},
		});
	}

	if (userUpdatedField) {
		relations.push({
			collection: copyCollName,
			field: fields.find(f => f === 'user_updated'),
			related_collection: 'directus_users',
			schema: {},
		});
	}

	return relations;
}

function onCopyCancel() {
	confirmCopy.value = false
	copyName.value = null
}
</script>

<template>
	<private-view :title="collectionInfo && formatTitle(collectionInfo.collection)" :is_prevent_main_content_scroll="true"
		i>
		<template #headline>
			<v-breadcrumb :items="[{ name: t('settings_data_model'), to: '/settings/data-model' }]" />
		</template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded icon exact to="/settings/data-model">
				<v-icon name="arrow_back" />
			</v-button>
		</template>

		<template #actions>
			<v-dialog v-model="confirmDelete" @esc="confirmDelete = false">
				<template #activator="{ on }">
					<v-button v-if="item && item.collection.startsWith('directus_') === false"
						v-tooltip.bottom="t('delete_collection')" rounded icon class="action-delete" secondary
						:disabled="item === null" @click="on">
						<v-icon name="delete" />
					</v-button>
				</template>

				<v-card>
					<v-card-title>{{ t('delete_are_you_sure') }}</v-card-title>

					<v-card-actions>
						<v-button secondary @click="confirmDelete = false">
							{{ t('cancel') }}
						</v-button>
						<v-button kind="danger" :loading="deleting" @click="deleteAndQuit">
							{{ t('delete_label') }}
						</v-button>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-button v-tooltip.bottom="t('save')" rounded icon :loading="saving" :disabled="hasEdits === false"
				@click="saveAndQuit">
				<v-icon name="check" />
			</v-button>

			<!-- COPPY COLLECTION LOGIC -->
			<v-dialog v-model="confirmCopy" @esc="confirmCopy = false">
				<template #activator="{ on }">
					<v-button v-tooltip.bottom="t('Copy Collection')" :disabled="isCopyBtnDisabled" rounded icon @click="on">
						<v-icon name="content_copy" />
					</v-button>
				</template>

				<v-card>
					<v-card-title>{{ t('Create a copy of this collection') }}</v-card-title>

					<v-card-text>
						<v-input v-model="copyName" db-safe autofocus full-width :placeholder="t('Collection Name...')" />
					</v-card-text>

					<v-card-actions>
						<v-button secondary @click="onCopyCancel">
							{{ t('cancel') }}
						</v-button>
						<v-button :loading="savingCopy" :disabled="!copyName" @click="createCopy">
							{{ t('copy') }}
						</v-button>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</template>

		<template #navigation>
			<settings-navigation />
		</template>

		<div class="collections-item">
			<div class="fields">
				<h2 class="title type-label">
					{{ t('fields_and_layout') }}
					<span class="instant-save">{{ t('saves_automatically') }}</span>
				</h2>
				<fields-management :collection="collection" />
			</div>

			<router-view name="field" :collection="collection" :field="field" :type="type" />

			<v-form v-model="edits.meta" collection="directus_collections" :loading="loading"
				:initial-values="item && item.meta" :primary-key="collection"
				:disabled="item && item.collection.startsWith('directus_')" />
		</div>

		<template #sidebar>
			<sidebar-detail icon="info" :title="t('information')" close>
				<div v-md="t('page_help_settings_datamodel_fields')" class="page-description" />
			</sidebar-detail>
		</template>

		<v-dialog v-model="confirmLeave" @esc="confirmLeave = false">
			<v-card>
				<v-card-title>{{ t('unsaved_changes') }}</v-card-title>
				<v-card-text>{{ t('unsaved_changes_copy') }}</v-card-text>
				<v-card-actions>
					<v-button secondary @click="discardAndLeave">
						{{ t('discard_changes') }}
					</v-button>
					<v-button @click="confirmLeave = false">{{ t('keep_editing') }}</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</private-view>
</template>

<style lang="scss" scoped>
.title {
	margin-bottom: 12px;

	.instant-save {
		margin-left: 4px;
		color: var(--theme--warning);
	}
}

.collections-item {
	padding: var(--content-padding);
	padding-top: 0;
	padding-bottom: var(--content-padding-bottom);
}

.fields {
	max-width: 800px;
	margin-bottom: 48px;
}

.header-icon {
	--v-button-background-color: var(--theme--primary-background);
	--v-button-color: var(--theme--primary);
	--v-button-background-color-hover: var(--theme--primary-subdued);
	--v-button-color-hover: var(--theme--primary);
}

.action-delete {
	--v-button-background-color-hover: var(--theme--danger) !important;
	--v-button-color-hover: var(--white) !important;
}
</style>
