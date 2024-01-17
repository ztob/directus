<script setup lang="ts">
import api from '@/api';
import { useExtension } from '@/composables/use-extension';
import { usePreset } from '@/composables/use-preset';
import LayoutSidebarDetail from '@/views/private/components/layout-sidebar-detail.vue';
import SearchInput from '@/views/private/components/search-input.vue';
import { useLayout } from '@directus/composables';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SettingsNavigation from '../../components/navigation.vue';

type Item = {
	[field: string]: any;
};

const { t } = useI18n();

const { layout, layoutOptions, layoutQuery, filter, search } = usePreset(ref('directus_keyvalue'));
const { layoutWrapper } = useLayout(layout);
const currentLayout = useExtension('layout', layout);
const { confirmDelete, deleting, deleteError, batchDelete } = useBatchDelete();
const { addNewLink, batchLink } = useLinks();

const layoutRef = ref();
const selection = ref<Item[]>([]);

async function refresh() {
	await layoutRef.value?.state?.refresh?.();
}

function useBatchDelete() {
	const confirmDelete = ref(false);
	const deleting = ref(false);
	const deleteError = ref<any>(null);

	return { confirmDelete, deleting, deleteError, batchDelete };

	async function batchDelete() {
		deleting.value = true;

		confirmDelete.value = false;

		const batchPrimaryKeys = selection.value;

		try {
			await api.delete(`/keyvalue`, {
				data: batchPrimaryKeys
			});

			selection.value = [];
			await refresh();
		} catch (err: any) {
			deleteError.value = err
		} finally {
			deleting.value = false;
		}
	}
}

function useLinks() {
	const addNewLink = computed<string>(() => {
		return `/settings/storage/+`;
	});

	const batchLink = computed<string>(() => {
		const batchPrimaryKeys = selection.value;
		return `/settings/storage/${batchPrimaryKeys}`;
	});

	return { addNewLink, batchLink };
}

function clearFilters() {
	filter.value = null;
	search.value = null;
}
</script>


<template>
	<component
		:is="layoutWrapper"
		ref="layoutRef"
		v-slot="{ layoutState }"
		v-model:selection="selection"
		v-model:layout-options="layoutOptions"
		v-model:layout-query="layoutQuery"
		:filter="filter"
		:search="search"
		collection="directus_keyvalue">
		<private-view
			:title="t('KeyValue Storage')"
			:small-header="currentLayout?.smallHeader"
			:header-shadow="currentLayout?.headerShadow">
			<template #headline><v-breadcrumb :items="[{ name: t('settings'), to: '/settings' }]" /></template>

			<template #title-outer:prepend>
				<v-button class="header-icon" rounded icon exact disabled>
					<v-icon name="storage" />
				</v-button>
			</template>

			<template #navigation>
				<settings-navigation />
			</template>

			<template #actions>
				<search-input v-model="search" v-model:filter="filter" collection="directus_keyvalue" />

				<v-dialog v-if="selection.length > 0" v-model="confirmDelete" @esc="confirmDelete = false">
					<template #activator="{ on }">
						<v-button rounded icon class="action-delete" secondary @click="on">
							<v-icon name="delete" />
						</v-button>
					</template>

					<v-card>
						<v-card-title>{{ t('batch_delete_confirm', selection.length) }}</v-card-title>

						<v-card-actions>
							<v-button secondary @click="confirmDelete = false">
								{{ t('cancel') }}
							</v-button>
							<v-button kind="danger" :loading="deleting" @click="batchDelete">
								{{ t('delete_label') }}
							</v-button>
						</v-card-actions>
					</v-card>
				</v-dialog>

				<v-button v-if="selection.length > 0" v-tooltip.bottom="t('edit')" rounded icon secondary :to="batchLink">
					<v-icon name="edit" />
				</v-button>

				<v-button v-tooltip.bottom="t('Create Item')" rounded icon :to="addNewLink">
					<v-icon name="add" />
				</v-button>
			</template>

			<component :is="`layout-${layout}`" v-bind="layoutState">
				<template #no-results>
					<v-info :title="t('no_results')" icon="search" center>
						{{ t('no_results_copy') }}

						<template #append>
							<v-button @click="clearFilters">{{ t('clear_filters') }}</v-button>
						</template>
					</v-info>
				</template>

				<template #no-items>
					<v-info :title="t('No Key-Value Items')" icon="storage" center>
						{{ t('No key-value items have been configured yet') }}

						<template #append>
							<v-button :to="{ path: '/settings/storage/+' }">{{ t('Create Item') }}</v-button>
						</template>
					</v-info>
				</template>
			</component>

			<template #sidebar>
				<sidebar-detail icon="info" :title="t('information')" close>
					<div v-md="t('Browse Key Value Items - Lists all key-value items within the project')" class="page-description" />
				</sidebar-detail>
				<layout-sidebar-detail v-model="layout">
					<component :is="`layout-options-${layout}`" v-bind="layoutState" />
				</layout-sidebar-detail>
				<component :is="`layout-sidebar-${layout}`" v-bind="layoutState" />
			</template>

			<v-dialog :model-value="deleteError !== null">
				<v-card>
					<v-card-title>{{ t('something_went_wrong') }}</v-card-title>
					<v-card-text>
						<v-error :error="deleteError" />
					</v-card-text>
					<v-card-actions>
						<v-button @click="deleteError = null">{{ t('done') }}</v-button>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</private-view>
	</component>
</template>


<style lang="scss" scoped>
.header-icon {
	--v-button-background-color-disabled: var(--theme--primary-background);
	--v-button-color-disabled: var(--theme--primary);
	--v-button-background-color-hover-disabled: var(--theme--primary-subdued);
	--v-button-color-hover-disabled: var(--theme--primary);
}

.action-delete {
	--v-button-background-color-hover: var(--theme--danger) !important;
	--v-button-color-hover: var(--white) !important;
}

.layout {
	--layout-offset-top: 64px;
}
</style>
