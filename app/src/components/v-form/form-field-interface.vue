<script setup lang="ts">
import { useExtension } from '@/composables/use-extension';
import { getDefaultInterfaceForType } from '@/utils/get-default-interface-for-type';
import { Type, Width } from '@directus/types';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FormField } from './types';
import { isAllowedBookmarksForField } from './composables/is-allowed-bookmarks-for-field'
import { FormFieldValues } from '@/types/v-form';

const props = defineProps<{
	field: FormField;
	batchMode?: boolean;
	batchActive?: boolean;
	primaryKey?: string | number | null;
	modelValue?: string | number | boolean | Record<string, any> | Array<any>;
	loading?: boolean;
	disabled?: boolean;
	autofocus?: boolean;
	rawEditorEnabled?: boolean;
	rawEditorActive?: boolean;
	direction?: string;
	isFilterLoading?: string;
	isUnusedCollsHidden?: boolean | null;
	searchCollections?: string | null;
	isItemSavable?: boolean
	itemEdits: FormFieldValues | null
}>();

defineEmits(['update:modelValue', 'setFieldValue', 'add-filter', 'copy-to-clipboard', 'm2o-field-value']);

const { t } = useI18n();

const inter = useExtension(
	'interface',
	computed(() => props.field?.meta?.interface ?? 'input'),
);

const interfaceExists = computed(() => !!inter.value);

const componentName = computed(() => {
	return props.field?.meta?.interface
		? `interface-${props.field.meta.interface}`
		: `interface-${getDefaultInterfaceForType(props.field.type!)}`;
});

const value = computed(() =>
	props.modelValue === undefined ? props.field.schema?.default_value ?? null : props.modelValue,
);

function isMakeCopyable(field: FormField) {
	if (field.meta?.interface === 'make-copyable-ext-from-interfaces') return false;

	return Boolean(field.meta?.options?._is_make_copyable);
}

function isAddFilterIcon(field: FormField) {
	if (field.meta?.interface === 'add-filter-ext-from-interfaces') return false;

	return Boolean(field.meta?.options?._is_add_filter);
}

// LOGIC FOR CREATING BOOKMARKS FROM FIELD IN ITEMS
function getClassForDropdown(fieldInterface: string | null | undefined, fieldWidth: Width | null | undefined, fieldType: Type) {
	const classes: Record<string, boolean> = {};

	if (!isAllowedBookmarksForField(fieldInterface, fieldType)) return classes

	if (fieldWidth === 'full') {
		classes['field-component_item-full'] = true;
	} else if (fieldWidth?.startsWith('half') || fieldWidth === 'fill') {
		classes['field-component_item-half'] = true;
	}

	return classes;
}
</script>

<template>
	<div class="interface" :class="{
		subdued: batchMode && batchActive === false,
	}">
		<v-skeleton-loader v-if="loading && field.hideLoader !== true" />

		<v-error-boundary v-if="interfaceExists && !rawEditorActive" :name="componentName">
			<div :class="getClassForDropdown(field.meta?.interface, field.meta?.width, field.type!)">
				<div class="field-component">
					<component :is="componentName" v-bind="(field.meta && field.meta.options) || {}"
						:autofocus="disabled !== true && autofocus" :disabled="disabled" :loading="loading" :value="value"
						:batch-mode="batchMode" :batch-active="batchActive" :width="(field.meta && field.meta.width) || 'full'"
						:type="field.type" :collection="field.collection" :field="field.field" :field-data="field"
						:primary-key="primaryKey" :length="field.schema && field.schema.max_length" :direction="direction"
						:is-unused-colls-hidden="isUnusedCollsHidden" :search-collections="searchCollections"
						:is-item-savable="isItemSavable" :item-edits="itemEdits"
						@input="$emit('update:modelValue', $event)" @set-field-value="$emit('setFieldValue', $event)"
						@m2o-field-value="$emit('m2o-field-value', $event)"
						>
					</component>

					<div
						:class="field.meta?.options?._is_make_copyable && field.meta?.options?._is_url_mode
							? 'field-component__two-appendings' : ''"
					>
						<span v-if="isMakeCopyable(field)" class="copy-icon">
							<v-icon v-tooltip="t('Copy to clipboard')" name="copy" small @click="$emit('copy-to-clipboard', value)" />
						</span>

						<a
							v-if="field.meta?.options?._is_url_mode"
							:href="(value as any)"
							target="_blank"
							:class="field.meta?.options?._is_make_copyable && field.meta?.options?._is_url_mode
							? 'link-icon-second' : 'link-icon'">
							<v-icon
								v-tooltip="t('Open link')"
								name="open_in_new"
							/>
						</a>
					</div>

					<span v-if="isAddFilterIcon(field)"
						:class="{ 'add-filter-with-icon': field.meta?.options?.iconRight, 'add-filter-without-icon': !field.meta?.options?.iconRight }">
						<v-progress-circular v-if="isFilterLoading === field.field" small indeterminate />

						<v-icon v-else v-tooltip="t('Add to filters')" name="add"
							@click="$emit('add-filter', { field: field.field, value })" />
					</span>
				</div>
				<div>
					<!-- SLOT FOR CREATING BOOKMARKS FOR SELECTION COMPONENTS WHEN BROWSING COLLS ITEMS -->
					<slot name="add-bookmarks" />
				</div>
			</div>

			<template #fallback>
				<v-notice type="warning">{{ t('unexpected_error') }}</v-notice>
			</template>
		</v-error-boundary>

		<interface-system-raw-editor v-else-if="rawEditorEnabled && rawEditorActive" :value="value" :type="field.type"
			@input="$emit('update:modelValue', $event)" />

		<v-notice v-else type="warning">
			{{ t('interface_not_found', { interface: field.meta && field.meta.interface }) }}
		</v-notice>
	</div>
</template>

<style lang="scss" scoped>
.interface {
	position: relative;

	.v-skeleton-loader {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 2;
		width: 100%;
		height: 100%;
	}

	&.subdued {
		opacity: 0.5;
	}
}

.field-component {
	position: relative;

	.add-filter-with-icon,
	.add-filter-without-icon,
	.copy-icon, .link-icon, .link-icon-second {
		--v-icon-color: var(--foreground-subdued);

		cursor: pointer;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);

		&:hover {
			--v-icon-color: #8866ff;
		}
	}

	.add-filter-with-icon {
		right: 45px;
		--v-icon-color: var(--theme--foreground-subdued);
		z-index: 1;
	}

	.add-filter-without-icon {
		right: 17px;
		--v-icon-color: var(--theme--foreground-subdued);
		z-index: 1;
	}

	.copy-icon, .link-icon {
		right: -35px;
	}

	.link-icon-second {
		right: -65px;
	}

	&_item-full {
		display: grid;
		grid-template-columns: 100% auto;
		align-items: center;
		gap: 5px;
			@media (max-width: 970px) {
				grid-template-columns: auto;

			:nth-child(2) {
				justify-self: end;
			}
		}
	}

	&_item-half {
		display: grid;
		grid-template-rows: auto auto;
		gap: 5px;

		:nth-child(2) {
			justify-self: end;
		}
	}

	&__two-appendings {
		display: flex;
		gap: 5px;
	}
}
</style>
