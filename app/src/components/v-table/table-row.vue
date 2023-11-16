<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ShowSelect } from '@directus/extensions';
import { computed, ref } from 'vue';
import type { Header, Item } from './types';

interface Props {
	headers: Header[];
	item: Item;
	showSelect: ShowSelect;
	showManualSort?: boolean;
	isSelected?: boolean;
	subdued?: boolean;
	sortedManually?: boolean;
	hasClickListener?: boolean;
	height?: number;
}

const props = withDefaults(defineProps<Props>(), {
	showSelect: 'none',
	showManualSort: false,
	isSelected: false,
	subdued: false,
	sortedManually: false,
	hasClickListener: false,
	height: 48,
});

defineEmits(['click', 'item-selected', 'add-filter']);

const cssHeight = computed(() => {
	return {
		tableRow: props.height + 2 + 'px',
		renderTemplateImage: props.height - 16 + 'px',
	};
});

// CHANGED
function isAddFilterIcon(header: Header) {
	if(header.field?.display === 'add-filter-ext-from-displays') return false
	return Boolean(header.field?.interfaceOptions?._is_add_filter)
}

const displayHovered = ref('')

const { t } = useI18n();
</script>

<template>
	<tr class="table-row" :class="{ subdued: subdued, clickable: hasClickListener }" @click="$emit('click', $event)">
		<td v-if="showManualSort" class="manual cell" @click.stop>
			<v-icon name="drag_handle" class="drag-handle" :class="{ 'sorted-manually': sortedManually }" />
		</td>

		<td v-if="showSelect !== 'none'" class="select cell" @click.stop>
			<v-checkbox
				:icon-on="showSelect === 'one' ? 'radio_button_checked' : undefined"
				:icon-off="showSelect === 'one' ? 'radio_button_unchecked' : undefined"
				:model-value="isSelected"
				@update:model-value="$emit('item-selected', $event)"
			/>
		</td>

		<td
		v-for="header in headers"
		:key="header.value"
		class="cell"
		:class="`align-${header.align}`"
		@mouseover="displayHovered = header.value"
		@mouseleave="displayHovered = ''"
		>

			<v-icon
			v-if="isAddFilterIcon(header)"
			name="add"
			@click.stop="$emit('add-filter', header.value, item[header.value])"
			:class="{ 'add-icon': true, 'add-icon-visible': displayHovered === header.value }"
			v-tooltip="t('Add to filters')"
			/>

			<slot
			:name="`item.${header.value}`"
			:item="item"
			>
				<v-text-overflow
					v-if="
						header.value.split('.').reduce((acc, val) => {
							return acc[val];
						}, item)
					"
					:text="
						header.value.split('.').reduce((acc, val) => {
							return acc[val];
						}, item)
					"
				/>
				<value-null v-else />
			</slot>
		</td>

		<td class="spacer cell" />
		<td v-if="$slots['item-append']" class="append cell" @click.stop>
			<slot name="item-append" />
		</td>
	</tr>
</template>

<style lang="scss" scoped>
.table-row {
	height: v-bind('cssHeight.tableRow');

	.cell {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		background-color: var(--v-table-background-color, transparent);
		border-bottom: var(--theme--border-width) solid var(--theme--border-color-subdued);

		&:last-child {
			padding: 0 12px;
		}

		&.select {
			display: flex;
			align-items: center;
		}
	}

	&.subdued .cell {
		opacity: 0.3;
	}

	&.clickable:not(.subdued):hover .cell {
		background-color: var(--theme--background-subdued);
		cursor: pointer;
	}

	.drag-handle {
		--v-icon-color: var(--theme--foreground-subdued);

		&.sorted-manually {
			--v-icon-color: var(--theme--foreground);

			&:hover {
				cursor: ns-resize;
			}
		}
	}

	.append {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	:deep(.render-template) {
		height: v-bind('cssHeight.tableRow');

		img {
			height: v-bind('cssHeight.renderTemplateImage');
		}
	}
}

// CHANGED
.add-icon {
	opacity: 0;
	--v-icon-color: var(--foreground-subdued);
}
.add-icon:hover {
	--v-icon-color: var(--foreground-normal);
}
.add-icon-visible {
	opacity: 1;
}
</style>
