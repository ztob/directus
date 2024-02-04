<script setup lang="ts">
import { useFieldsStore } from '@/stores/fields';
import { hideDragImage } from '@/utils/hide-drag-image';
import { useCollection } from '@directus/composables';
import { Field, LocalType } from '@directus/types';
import { isNil, orderBy } from 'lodash';
import { computed, toRefs, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Draggable from 'vuedraggable';
import FieldSelect from './field-select.vue';
import { useRouter } from 'vue-router';
import { searchFieldsHelper } from '../composables/search-fields-helper'

const props = defineProps<{
	collection: string;
	isShowFieldsType: boolean | null
	searchFields: string | null
}>();

const { t } = useI18n();

const { collection } = toRefs(props);
const { fields } = useCollection(collection);
const fieldsStore = useFieldsStore();
const router = useRouter();

const fieldSortPosition = ref<number | null>(null)

const parsedFields = computed(() => {
	const fieldsOrdered = orderBy(fields.value, [(o) => (o.meta?.sort ? Number(o.meta?.sort) : null), (o) => o.meta?.id]).filter(
		(field) => field.field.startsWith('$') === false,
	);

	// search for fields by their names and types
	if (props.searchFields !== null) {
		return searchFieldsHelper(fieldsOrdered, props.searchFields)
	}

	return fieldsOrdered
});

const lockedFields = computed(() => {
	return parsedFields.value.filter((field) => field.meta?.system === true);
});

const usableFields = computed(() => {
	return parsedFields.value.filter((field) => field.meta?.system !== true);
});

const addOptions = computed<Array<{ type: LocalType; icon: string; text: any } | { divider: boolean }>>(() => [
	{
		type: 'standard',
		icon: 'create',
		text: t('standard_field'),
	},
	{
		type: 'presentation',
		icon: 'scatter_plot',
		text: t('presentation_and_aliases'),
	},
	{
		type: 'group',
		icon: 'view_in_ar',
		text: t('field_group'),
	},
	{
		divider: true,
	},
	{
		type: 'file',
		icon: 'photo',
		text: t('single_file'),
	},
	{
		type: 'files',
		icon: 'collections',
		text: t('multiple_files'),
	},
	{
		divider: true,
	},
	{
		type: 'm2o',
		icon: 'call_merge',
		text: t('m2o_relationship'),
	},
	{
		type: 'o2m',
		icon: 'call_split',
		text: t('o2m_relationship'),
	},
	{
		type: 'm2m',
		icon: 'import_export',
		text: t('m2m_relationship'),
	},
	{
		type: 'm2a',
		icon: 'gesture',
		text: t('m2a_relationship'),
	},
	{
		divider: true,
	},
	{
		type: 'translations',
		icon: 'translate',
		text: t('translations'),
	},
]);

async function setSort(fields: Field[]) {
	const updates = fields.map((field, index) => ({
		field: field.field,
		meta: {
			sort: index + 1,
			group: null,
		},
	}));

	await fieldsStore.updateFields(collection.value, updates);
}

async function setNestedSort(updates?: Field[]) {
	updates = (updates || []).filter((val) => isNil(val) === false);

	if (updates.length > 0) {
		await fieldsStore.updateFields(collection.value, updates);
	}
}

// ADD FIELD AT SPECIFIC POSITION LOGIC
function addFieldAtPosition(fieldSort: number) {
	fieldSortPosition.value = fieldSort
	router.push(`/settings/data-model/${collection.value}/+`)
}

watch(fields, (newFields, oldFields) => {
	if (!newFields.length) return

	if(newFields.length === oldFields.length) {
		fieldSortPosition.value = null
		return
	}

	if (fieldSortPosition.value === null) return

	updateFieldsSorts(newFields)

	fieldSortPosition.value = null
})

// set fieldSortPosition.value to null when user canceled new field creation at a specific position
watch(() => router, (newRouter) => {
	if(newRouter.currentRoute.value?.params?.field !== '+') {
		fieldSortPosition.value = null
	}
}, { deep: true })

async function updateFieldsSorts(newFields: Field[]) {
	const lastNewFieldInd = newFields.length - 1

	const newOrderedFields = newFields.map((field, ind) => {

		// grab last added field and change its sort
		if (lastNewFieldInd === ind) {
			return updateFieldSort(field, fieldSortPosition.value! + 1)
		}

		// grab all fields that are sort-bigger than the chosen field to add a new field after and increase their sort by one
		if (field.meta!.sort! > fieldSortPosition.value!) {
			return updateFieldSort(field, field.meta!.sort! + 1)
		}

		return field
	})

	await fieldsStore.updateFields(collection.value, newOrderedFields);

	function updateFieldSort(field: Field, sort: number) {
		return {
			...field,
			meta: {
				...field.meta,
				sort
			}
		}
	}
}
</script>

<template>
	<div class="fields-management">
		<div v-if="lockedFields.length > 0" class="field-grid">
			<field-select
				v-for="field in lockedFields"
				:key="field.field"
				disabled
				:field="field"
				:is-show-fields-type="isShowFieldsType"
			/>
		</div>

		<draggable
			class="field-grid"
			:model-value="usableFields.filter((field) => isNil(field?.meta?.group))"
			force-fallback
			handle=".drag-handle"
			:group="{ name: 'fields' }"
			:set-data="hideDragImage"
			item-key="field"
			:animation="150"
			fallback-on-body
			invert-swap
			@update:model-value="setSort"
		>
			<template #item="{ element }">
					<field-select
						:field="element"
						:fields="usableFields"
						:is-show-fields-type="isShowFieldsType"
						@set-nested-sort="setNestedSort"
						@field-at-position="addFieldAtPosition"
					/>
				</template>
		</draggable>

		<v-notice v-if="searchFields?.trim().length && !parsedFields.length" type="info">No Fields Found</v-notice>

		<v-button full-width :to="`/settings/data-model/${collection}/+`">
			{{ t('create_field') }}
		</v-button>

		<v-menu show-arrow>
			<template #activator="{ toggle, active }">
				<button class="add-field-advanced" :dashed="!active" :class="{ active }" @click="toggle">
					{{ t('create_in_advanced_field_creation_mode') }}
				</button>
			</template>
			<v-list>
				<template v-for="(option, index) in addOptions" :key="index">
					<v-divider v-if="option.divider === true" />
					<v-list-item v-else :to="`/settings/data-model/${collection}/+?type=${option.type}`">
						<v-list-item-icon>
							<v-icon :name="option.icon" />
						</v-list-item-icon>
						<v-list-item-content>
							{{ option.text }}
						</v-list-item-content>
					</v-list-item>
				</template>
			</v-list>
		</v-menu>
	</div>
</template>

<style lang="scss" scoped>
.v-divider {
	margin: 32px 0;
}

.fields-management {
	margin-bottom: 24px;
}

.field-grid {
	position: relative;
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	padding-bottom: 24px;
}

.field-select {
	margin: 4px;
}

.field-select:deep(.field-grid) {
	grid-gap: 0;
}

.field-select:deep(.field-grid.group.full.nested) {
	margin: 4px 0;

	.field-select {
		margin: 4px;
	}
}

.add-field {
	--v-button-font-size: 14px;
	--v-button-background-color: var(--theme--primary);
	--v-button-background-color-hover: var(--theme--primary-accent);

	margin-top: -12px;
}

.add-field-advanced {
	display: block;
	width: max-content;
	margin: 0 auto;
	margin-top: 8px;
	color: var(--theme--foreground-subdued);
	transition: color var(--fast) var(--transition);

	&:hover {
		color: var(--theme--foreground);
	}
}

.visible {
	margin-bottom: 24px;
}

.list-move {
	transition: transform 0.5s;
}
</style>
../composables/use-search-fields
