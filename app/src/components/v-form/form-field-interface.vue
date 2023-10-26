<script setup lang="ts">
import { useExtension } from '@/composables/use-extension';
import { getDefaultInterfaceForType } from '@/utils/get-default-interface-for-type';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FormField } from './types';

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
	isFilterLoading: string
}>();

defineEmits(['update:modelValue', 'setFieldValue', 'add-filter']);

const { t } = useI18n();

const inter = useExtension(
	'interface',
	computed(() => props.field?.meta?.interface ?? 'input')
);

const interfaceExists = computed(() => !!inter.value);

const componentName = computed(() => {
	return props.field?.meta?.interface
		? `interface-${props.field.meta.interface}`
		: `interface-${getDefaultInterfaceForType(props.field.type!)}`;
});

const value = computed(() =>
	props.modelValue === undefined ? props.field.schema?.default_value ?? null : props.modelValue
);

// CHANGED
function isAddFilterIcon(field: FormField) {
	if (field.meta?.interface === "add-filter-ext-from-interfaces") return false
	return Boolean(field.meta?.options?._is_add_filter)
}

</script>

<template>
	<div
		class="interface"
		:class="{
			subdued: batchMode && batchActive === false,
		}"
	>
		<v-skeleton-loader v-if="loading && field.hideLoader !== true" />

		<v-error-boundary v-if="interfaceExists && !rawEditorActive" :name="componentName">
			<div
				class="field-component"
			>
				<component
				:is="componentName"
				v-bind="(field.meta && field.meta.options) || {}"
				:autofocus="disabled !== true && autofocus"
				:disabled="disabled"
				:loading="loading"
				:value="value"
				:batch-mode="batchMode"
				:batch-active="batchActive"
				:width="(field.meta && field.meta.width) || 'full'"
				:type="field.type"
				:collection="field.collection"
				:field="field.field"
				:field-data="field"
				:primary-key="primaryKey"
				:length="field.schema && field.schema.max_length"
				:direction="direction"
				@input="$emit('update:modelValue', $event)"
				@set-field-value="$emit('setFieldValue', $event)"
				/>
				<span class="add-icon">
					<v-progress-circular v-if="isFilterLoading === field.field" small indeterminate/>
					<v-icon
						v-if="isFilterLoading !== field.field && isAddFilterIcon(field)"
						v-tooltip="t('Add to filters')"
						name="add"
						@click="$emit('add-filter', { field: field.field, value })"
					/>
				</span>
			</div>

			<template #fallback>
				<v-notice type="warning">{{ t('unexpected_error') }}</v-notice>
			</template>
		</v-error-boundary>

		<interface-system-raw-editor
			v-else-if="rawEditorEnabled && rawEditorActive"
			:value="value"
			:type="field.type"
			@input="$emit('update:modelValue', $event)"
		/>

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

// CHANGED
.field-component {
	// display: flex;
	// align-items: center;
	position: relative;
	.add-icon {
		cursor: pointer;
		--v-icon-color: var(--foreground-subdued);
		position: absolute;
		right: -30px;
		top: 50%;
		transform: translateY(-50%);
		&:hover {
			color: #8866FF;
		}
	}
}
</style>
