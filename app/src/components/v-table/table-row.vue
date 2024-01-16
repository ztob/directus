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

defineEmits(['click', 'item-selected', 'add-filter', 'copy-to-clipboard']);

const cssHeight = computed(() => {
	return {
		tableRow: props.height + 2 + 'px',
		renderTemplateImage: props.height - 16 + 'px',
	};
});

function isAddFilter(header: Header) {
	if (header.field?.display === 'add-filter-ext-from-displays') return false;

	return Boolean(header.field?.interfaceOptions?._is_add_filter);
}

function isMakeCopyable(header: Header) {
	if (header.field?.display === 'make-copyable-ext-from-displays') return false;

	return Boolean(header.field?.interfaceOptions?._is_make_copyable);
}

const displayHovered = ref('');

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
			<slot :name="`item.${header.value}`" :item="item">
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

			<div class="actions">
				<v-icon
					v-if="isMakeCopyable(header)"
					v-tooltip="t('Copy to clipboard')"
					name="copy"
					class="copy-icon"
					:class="{ visible: displayHovered === header.value }"
					small
					@click.stop="$emit('copy-to-clipboard', item[header.value])"
				/>

				<v-icon
					v-if="isAddFilter(header)"
					v-tooltip="t('Add to filters')"
					name="add"
					class="add-icon"
					:class="{ visible: displayHovered === header.value }"
					@click.stop="$emit('add-filter', header.value, item[header.value])"
				/>

				<a v-if="header.field?.interfaceOptions?._is_url_mode" :href="`${item[header.value]}`" target="_blank" @click.stop>
					<v-icon
						v-tooltip="t('Open link')"
						name="open_in_new"
						class="url-icon"
						:class="{ visible: displayHovered === header.value }"
					/>
				</a>
			</div>
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
		justify-content: space-between;
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

		.actions {
			display: inline-flex;
			align-items: center;
			gap: 5px;

			.add-icon,
			.copy-icon,
			.url-icon {
				--v-icon-color: var(--foreground-subdued);

				opacity: 0;

				&:hover {
					--v-icon-color: var(--foreground-normal);
				}

				&.visible {
					opacity: 1;
				}
			}
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
</style>
