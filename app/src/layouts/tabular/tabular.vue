<script setup lang="ts">
import { HeaderRaw } from '@/components/v-table/types';
import { AliasFields, useAliasFields } from '@/composables/use-alias-fields';
import { usePageSize } from '@/composables/use-page-size';
import { useShortcut } from '@/composables/use-shortcut';
import { usePermissionsStore } from '@/stores/permissions';
import { useUserStore } from '@/stores/user';
import { Collection } from '@/types/collections';
import { useSync } from '@directus/composables';
import { get, getEndpoint } from '@directus/utils';
import type { Field, Filter, Item, Preset, ShowSelect } from '@directus/types';
import { ComponentPublicInstance, Ref, computed, inject, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DrawerItem from '@/views/private/components/drawer-item.vue';
import { unexpectedError } from '@/utils/unexpected-error';
import { copyToClipboard } from '@/utils/copy-to-clipboard';
import { notify } from '@/utils/notify';
import api from '@/api';
import { nextTick } from 'vue';
import { createDropdownBookmarks } from '@/utils/create-dropdown-bookmarks';
import { useAddFilterFromInterface } from '@/composables/use-add-filter-from-interface';

defineOptions({ inheritAttrs: false });

interface Props {
	collection: string;
	selection?: Item[];
	readonly: boolean;
	tableHeaders: HeaderRaw[];
	showSelect?: ShowSelect;
	items: Item[];
	loading: boolean;
	error?: any;
	totalPages: number;
	tableSort?: { by: string; desc: boolean } | null;
	onRowClick: (item: Item) => void;
	tableRowHeight: number;
	page: number;
	toPage: (newPage: number) => void;
	itemCount?: number;
	fields: string[];
	limit: number;
	primaryKeyField?: Field;
	info?: Collection;
	sortField?: string;
	changeManualSort: (data: any) => Promise<void>;
	resetPresetAndRefresh: () => Promise<void>;
	selectAll: () => void;
	filterUser?: Filter;
	search?: string;
	aliasedFields: Record<string, AliasFields>;
	aliasedKeys: string[];
	onSortChange: (newSort: { by: string; desc: boolean }) => void;
	onAlignChange?: (field: 'string', align: 'left' | 'center' | 'right') => void;
	useSideDrawer: boolean;
	sideDrawerOpen: boolean;
	sideDrawerItemKey: string | null;
	refresh: () => void;
	filter?: Filter | null
	layout?: string | null
	layoutOptions?: Record<string, any>
	saveCurrentAsBookmark?: (overrides: Partial<Preset>) => Promise<any>
}

const props = withDefaults(defineProps<Props>(), {
	selection: () => [],
	showSelect: 'none',
	error: null,
	itemCount: undefined,
	tableSort: undefined,
	primaryKeyField: undefined,
	info: undefined,
	sortField: undefined,
	filterUser: undefined,
	search: undefined,
	onAlignChange: () => undefined,
});

const emit = defineEmits([
	'update:selection',
	'update:tableHeaders',
	'update:limit',
	'update:fields',
	'update:sideDrawerOpen',
	'update:sideDrawerItemKey',
	'update:filter'
]);

const { t } = useI18n();
const { collection } = toRefs(props);

const selectionWritable = useSync(props, 'selection', emit);
const tableHeadersWritable = useSync(props, 'tableHeaders', emit);
const limitWritable = useSync(props, 'limit', emit);
const sideDrawerOpenWritable = useSync(props, 'sideDrawerOpen', emit);
const sideDrawerItemKey = useSync(props, 'sideDrawerItemKey', emit);

const itemDrawer = ref();
const interceptPageLoad = ref<boolean>(false);
const newItemIndex = ref<number>(0);

const lastVisitedRow = computed<number>(() => {
	return props.items.findIndex((item) => item[props.primaryKeyField!.field] === sideDrawerItemKey.value);
});

const backDisabled = computed<boolean>(() => {
	return lastVisitedRow.value === 0 && props.page === 1;
});

const nextDisabled = computed<boolean>(() => {
	return lastVisitedRow.value === props.items.length - 1 && props.page === props.totalPages;
});

watch(lastVisitedRow, (value) => {
	// Remove visited class from all rows
	const rows = document.querySelectorAll('main > div > .v-table tr.visited');
	rows.forEach((row) => row.classList.remove('visited'));

	if (value !== -1) {
		const row = document.querySelector(`main > div > .v-table tr:not(.fixed):nth-child(${value + 1})`);
		row?.classList.add('visited');
	}
});

async function saveItem(values: Record<string, any>): Promise<void> {
	try {
		await api.patch(`${getEndpoint(collection.value)}/${sideDrawerItemKey.value}`, values);
	} catch (err: any) {
		unexpectedError(err);
	}

	await props.refresh();
}

function advanceItem(amount: number) {
	let index = lastVisitedRow.value;

	// console.log('[Advance] Index = ', index, 'key = ', sideDrawerItemKey.value);
	if (index === -1) {
		return;
	}

	index += amount;

	if (index < 0) {
		if (props.page > 1) {
			interceptPageLoad.value = true;
			newItemIndex.value = props.limit - 1;
			props.toPage(props.page - 1);
			return;
		} else {
			index = 0;
		}
	} else if (index >= props.items.length) {
		if (props.page < props.totalPages) {
			interceptPageLoad.value = true;
			newItemIndex.value = 0;
			props.toPage(props.page + 1);
			return;
		} else {
			index = props.items.length - 1;
		}
	}

	const item = props.items[index];
	const newKey = item[props.primaryKeyField!.field];

	// console.log('[Advance] Limit = ', props.limit, 'Page = ', props.page, '/ ', props.totalPages);
	// console.log('[Normal] New index = ', index, 'new key = ', newKey);
	if (sideDrawerItemKey.value !== newKey) {
		sideDrawerItemKey.value = newKey;

		nextTick(async () => {
			await itemDrawer.value.fetchItem();
		});
	}
}

const mainElement = inject<Ref<Element | undefined>>('main-element');

const table = ref<ComponentPublicInstance>();

watch(
	() => props.page,
	() => mainElement?.value?.scrollTo({ top: 0, behavior: 'smooth' }),
);

watch(
	() => props.items,
	() => {
		if (interceptPageLoad.value) {
			interceptPageLoad.value = false;
			const item = props.items[newItemIndex.value];
			const newKey = item[props.primaryKeyField!.field];

			// console.log('[Watcher] Limit = ', props.limit, 'Page = ', props.page, '/ ', props.totalPages);
			// console.log('[Watcher] New index = ', newItemIndex.value, 'new key = ', newKey);
			if (sideDrawerItemKey.value !== newKey) {
				sideDrawerItemKey.value = newKey;

				nextTick(async () => {
					await itemDrawer.value.fetchItem();
				});
			}
		}
	}
);

useShortcut(
	'meta+a',
	() => {
		props.selectAll();
	},
	table,
);

useShortcut(
	['arrowright', 'arrowleft'],
	(event) => {
		if (!props.useSideDrawer || !sideDrawerOpenWritable.value) {
			return;
		}

		advanceItem(event.key === 'ArrowRight' ? 1 : -1);
	},
	itemDrawer
);

const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

const { sizes: pageSizes, selected: selectedSize } = usePageSize<string>(
	[25, 50, 100, 250, 500, 1000],
	(value) => String(value),
	props.limit,
);

if (limitWritable.value !== selectedSize) {
	limitWritable.value = selectedSize;
}

const showManualSort = computed(() => {
	if (!props.sortField) return false;

	const isAdmin = userStore.currentUser?.role?.admin_access;

	if (isAdmin) return true;

	const permission = permissionsStore.getPermissionsForUser(props.collection, 'update');

	if (!permission) return false;

	if (Array.isArray(permission.fields) && permission.fields.length > 0) {
		return permission.fields.includes(props.sortField) || permission.fields.includes('*');
	}

	return true;
});

const fieldsWritable = useSync(props, 'fields', emit);

const { getFromAliasedItem } = useAliasFields(fieldsWritable, collection);

function addField(fieldKey: string) {
	const headerName = addFieldFromHeaderValue.value

	if(headerName) {
		const addAtIndex = fieldsWritable.value.findIndex(h => h === headerName)
		const existedHeaders = fieldsWritable.value
		fieldsWritable.value = [ ...existedHeaders.slice(0, addAtIndex + 1), fieldKey, ...existedHeaders.slice(addAtIndex + 1) ]
		return
	}

	fieldsWritable.value = [...fieldsWritable.value, fieldKey];
}

function removeField(fieldKey: string) {
	fieldsWritable.value = fieldsWritable.value.filter((field) => field !== fieldKey);
}

function transformToText(obj: any): string {
	if (typeof obj === 'object') {
		if (obj === null) {
			return 'null';
		} else if (Array.isArray(obj)) {
			return obj.map((item) => transformToText(item)).join('; ');
		} else {
			// If the object has an ID, make sure it is the first field
			const id = obj.id;

			let str = Object.values(obj)
				.filter((value) => value !== id)
				.map((value) => transformToText(value))
				.join(', ');

			if (id != null) {
				str = `${id}, ${str}`;
			}

			return str;
		}
	}

	return String(obj);
}

/**
 * Copies the values present in the given column to the clipboard
 * @param fieldKey The name of the field
 */
async function copyValues(fieldKey: string) {
	const values = props.items.map((item) => transformToText(get(item, fieldKey)));
	const result = await copyToClipboard(values.join('\n'));

	if (result) {
		notify({
			type: 'success',
			title: t('copy_raw_value_success'),
		});
	} else {
		notify({
			type: 'error',
			title: t('copy_raw_value_fail'),
		});
	}
}

// LOGIC FOR ADDING HEADER FOR TABLE AFTER A CERTAIN HEADER
const addFieldFromHeaderValue = ref(null)
const openMenuId = ref<string | null>(null)

function onActivator(toggle: () => void, id: string) {
	// remember the currently open menu and make this only menu open for the entire table
	openMenuId.value = id
	toggle()
}

// LOGIC FOR ADDING FILTER FROM SAME PAGE VIEW SECTION
const filterHelper = computed({
	get() {
		return props.filter
	},
	set(filter) {
		emit('update:filter', filter)
	}
})

const { isFilterLoading, onAddFilter } = useAddFilterFromInterface(
	filterHelper,
	() => {
		sideDrawerOpenWritable.value = false
	},
)

// LOGIC FOR CREATING BOOKMARKS FROM INTERFACE WHEN SAME PAGE VIEW
function onAddBookmarks(...bookmarkData: Record<string, any>[]) {
	createDropdownBookmarks(
		...bookmarkData,
		collection.value,
		props.saveCurrentAsBookmark,
		props.layoutOptions,
		props.layout,
		() => sideDrawerOpenWritable.value = false
	)
}
</script>

<template>
	<div class="layout-tabular">
		<v-table
			v-if="loading || (itemCount && itemCount > 0 && !error)"
			ref="table"
			v-model="selectionWritable"
			v-model:headers="tableHeadersWritable"
			class="table"
			fixed-header
			:show-select="showSelect ? showSelect : selection !== undefined"
			show-resize
			must-sort
			:sort="tableSort"
			:items="items"
			:loading="loading"
			:row-height="tableRowHeight"
			:item-key="primaryKeyField?.field"
			:show-manual-sort="showManualSort"
			:manual-sort-key="sortField"
			allow-header-reorder
			selection-use-keys

			:add-after-header="addFieldFromHeaderValue"
			:isMenuOpen="openMenuId !== null"

			@click:row="onRowClick"
			@update:sort="onSortChange"
			@manual-sort="changeManualSort"

			@clicked-header="addFieldFromHeaderValue = $event"
			>
			<template v-for="header in tableHeaders" :key="header.value" #[`item.${header.value}`]="{ item }">
				<render-display
					:value="getFromAliasedItem(item, header.value)"
					:display="header.field.display"
					:options="header.field.displayOptions"
					:interface="header.field.interface"
					:interface-options="header.field.interfaceOptions"
					:type="header.field.type"
					:collection="header.field.collection"
					:field="header.field.field"
				/>
			</template>

			<template #header-context-menu="{ header }">
				<v-list>
					<v-list-item
						:disabled="!header.sortable"
						:active="tableSort?.by === header.value && tableSort?.desc === false"
						clickable
						@click="onSortChange({ by: header.value, desc: false })"
					>
						<v-list-item-icon>
							<v-icon name="sort" class="flip" />
						</v-list-item-icon>
						<v-list-item-content>
							{{ t('sort_asc') }}
						</v-list-item-content>
					</v-list-item>

					<v-list-item
						:active="tableSort?.by === header.value && tableSort?.desc === true"
						:disabled="!header.sortable"
						clickable
						@click="onSortChange({ by: header.value, desc: true })"
					>
						<v-list-item-icon>
							<v-icon name="sort" />
						</v-list-item-icon>
						<v-list-item-content>
							{{ t('sort_desc') }}
						</v-list-item-content>
					</v-list-item>

					<v-divider />

					<v-list-item :active="header.align === 'left'" clickable @click="onAlignChange?.(header.value, 'left')">
						<v-list-item-icon>
							<v-icon name="format_align_left" />
						</v-list-item-icon>
						<v-list-item-content>
							{{ t('left_align') }}
						</v-list-item-content>
					</v-list-item>
					<v-list-item :active="header.align === 'center'" clickable @click="onAlignChange?.(header.value, 'center')">
						<v-list-item-icon>
							<v-icon name="format_align_center" />
						</v-list-item-icon>
						<v-list-item-content>
							{{ t('center_align') }}
						</v-list-item-content>
					</v-list-item>
					<v-list-item :active="header.align === 'right'" clickable @click="onAlignChange?.(header.value, 'right')">
						<v-list-item-icon>
							<v-icon name="format_align_right" />
						</v-list-item-icon>
						<v-list-item-content>
							{{ t('right_align') }}
						</v-list-item-content>
					</v-list-item>

					<v-divider />

					<v-list-item :active="header.align === 'right'" clickable @click="removeField(header.value)">
						<v-list-item-icon>
							<v-icon name="remove" />
						</v-list-item-icon>
						<v-list-item-content>
							{{ t('hide_field') }}
						</v-list-item-content>
					</v-list-item>

					<v-divider />

					<v-list-item clickable @click="copyValues(header.value)">
						<v-list-item-icon>
							<v-icon name="content_copy" />
						</v-list-item-icon>
						<v-list-item-content>{{ t('copy') }}</v-list-item-content>
					</v-list-item>
				</v-list>
			</template>

			<template #header-append>
				<v-menu v-model:open-menu-id="openMenuId" :is-tabular="true" placement="bottom-end" show-arrow :close-on-content-click="false" >
					<template #activator="{ toggle, active, id }">
						<v-icon
							v-tooltip="t('add_field')"
							class="add-field"
							name="add"
							:class="{ active }"
							clickable
							@click="onActivator(toggle, id)"
						/>
					</template>

					<v-field-list
						:collection="collection"
						:disabled-fields="fields"
						:allow-select-all="false"
						@add="addField($event[0])"
					/>
				</v-menu>
			</template>

			<template #footer>
				<div class="footer">
					<div class="pagination">
						<v-pagination
							v-if="totalPages > 1"
							:length="totalPages"
							:total-visible="7"
							show-first-last
							:model-value="page"
							@update:model-value="toPage"
						/>
					</div>

					<div v-if="loading === false && (items.length >= 25 || limit < 25)" class="per-page">
						<span>{{ t('per_page') }}</span>
						<v-select
							:model-value="`${limit}`"
							:items="pageSizes"
							inline
							@update:model-value="limitWritable = +$event"
						/>
					</div>
				</div>
			</template>
		</v-table>

		<v-info v-else-if="error" type="danger" :title="t('unexpected_error')" icon="error" center>
			{{ t('unexpected_error_copy') }}

			<template #append>
				<v-error :error="error" />

				<v-button small class="reset-preset" @click="resetPresetAndRefresh">
					{{ t('reset_page_preferences') }}
				</v-button>
			</template>
		</v-info>

		<slot v-else-if="itemCount === 0 && (filterUser || search)" name="no-results" />
		<slot v-else-if="itemCount === 0" name="no-items" />

		<drawer-item
			ref="itemDrawer"
			v-model:active="sideDrawerOpenWritable"
			:collection="collection"
			:primary-key="sideDrawerItemKey"
			is-coll-item
			:is-filter-loading="isFilterLoading"
			@add-filter="onAddFilter"
			@create-field-bookmarks="onAddBookmarks"
			@input="saveItem"
		>
			<template #actions>
				<v-button v-tooltip.bottom="t('back')" icon rounded @click="advanceItem(-1)" :disabled="backDisabled">
					<v-icon name="navigate_before" />
				</v-button>
				<v-button v-tooltip.bottom="t('next')" icon rounded @click="advanceItem(1)" :disabled="nextDisabled">
					<v-icon name="navigate_next" />
				</v-button>
			</template>
		</drawer-item>
	</div>
</template>

<style lang="scss" scoped>
.layout-tabular {
	display: contents;
	margin: var(--content-padding);
	margin-bottom: var(--content-padding-bottom);
}

.v-table {
	--v-table-sticky-offset-top: var(--layout-offset-top);

	display: contents;

	& > :deep(table) {
		min-width: calc(100% - var(--content-padding)) !important;
		margin-left: var(--content-padding);

		tr {
			margin-right: var(--content-padding);
		}

		tr.visited > td {
			background-color: var(--primary-25);
		}
		tr.visited:hover > td {
			background-color: var(--primary-25) !important;
		}
	}
}

.footer {
	position: sticky;
	left: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 32px var(--content-padding);

	.pagination {
		display: inline-block;
	}

	.per-page {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		width: 240px;
		color: var(--theme--foreground-subdued);

		span {
			width: auto;
			margin-right: 4px;
		}

		.v-select {
			color: var(--theme--foreground);
		}
	}
}

.reset-preset {
	margin-top: 24px;
}

.add-field {
	--v-icon-color-hover: var(--theme--foreground);

	&.active {
		--v-icon-color: var(--theme--foreground);
	}
}

.flip {
	transform: scaleY(-1);
}

.item-drawer-content {
	padding: 0 var(--content-padding);
}
</style>
