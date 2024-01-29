<script setup lang="ts">
import { Header as TableHeader } from '@/components/v-table/types';
import { fetchAll } from '@/utils/fetch-all';
import { translate } from '@/utils/translate-object-values';
import { unexpectedError } from '@/utils/unexpected-error';
import { Role } from '@directus/types';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import SettingsNavigation from '../../components/navigation.vue';
import { hideFormUnusedItemsField } from '@/composables/use-hide-unused-items';
import { RoleItem, RoleResponse } from './types/roles'
import { useSelectDeleteRoles } from './composables/use-select-delete-roles'

const { t } = useI18n();

const router = useRouter();

const roles = ref<RoleItem[]>([]);
const loading = ref(false);

const lastAdminRoleId = computed(() => {
	const adminRoles = roles.value.filter((role) => role.admin_access === true);
	return adminRoles.length === 1 ? (adminRoles[0] as RoleItem).id : null;
});

const tableHeaders = ref<TableHeader[]>([
	{
		text: '',
		value: 'icon',
		sortable: false,
		width: 42,
		align: 'left',
		description: null,
	},
	{
		text: t('name'),
		value: 'name',
		sortable: false,
		width: 200,
		align: 'left',
		description: null,
	},
	{
		text: t('users'),
		value: 'count',
		sortable: false,
		width: 140,
		align: 'left',
		description: null,
	},
	{
		text: t('description'),
		value: 'description',
		sortable: false,
		width: 470,
		align: 'left',
		description: null,
	},
]);

fetchRoles();

const addNewLink = computed(() => {
	return `/settings/roles/+`;
});

async function fetchRoles() {
	loading.value = true;

	try {
		const response = await fetchAll<RoleResponse>(`/roles`, {
			params: {
				limit: -1,
				fields: ['id', 'name', 'description', 'icon', 'admin_access', 'users'],
				deep: {
					users: {
						_aggregate: { count: 'id' },
						_groupBy: ['role'],
						_sort: 'role',
						_limit: -1,
					},
				},
				sort: 'name',
			},
		});

		roles.value = [
			{
				public: true,
				name: t('public_label'),
				icon: 'public',
				description: t('public_description'),
				id: 'public',
			},
			...response.map((role) => {
				return {
					...translate(role),
					count: role.users[0]?.count.id || 0,
				};
			}),
		];
	} catch (error) {
		unexpectedError(error);
	} finally {
		loading.value = false;
	}
}

function navigateToRole({ item }: { item: Role }) {
	if (item.id !== 'public' && lastAdminRoleId.value) {
		router.push({
			name: 'settings-roles-item',
			params: { primaryKey: item.id, lastAdminRoleId: lastAdminRoleId.value },
		});
	} else {
		router.push(`/settings/roles/${item.id}`);
	}
}

// LOGIC TO SEARCH FOR ROLES
const searchRoles = ref<string | null>(null)
const rolesSearchCopy = ref<RoleItem[]>([])

watch(searchRoles, () => {
	if (searchRoles.value !== null) {
		rolesSearchCopy.value = roles.value.filter(role => role.name.toLowerCase().includes(searchRoles.value!.toLowerCase()))
	}
})

// LOGIC TO HIDE THE HIDE_UNUSED_COLLS FIELD FOR ROLES
hideFormUnusedItemsField('directus_roles', 'hide_unused_colls')

// logic to handle selected roles
const { selectedRoles, deleting, confirmDelete, deleteSelectedRoles } = useSelectDeleteRoles(fetchRoles)

</script>

<template>
	<private-view :title="t('settings_permissions')">
		<template #headline><v-breadcrumb :items="[{ name: t('settings'), to: '/settings' }]" /></template>

		<template #title-outer:prepend>
			<v-button class="header-icon" rounded icon exact disabled>
				<v-icon name="admin_panel_settings" />
			</v-button>
		</template>

		<template #actions>
			<v-input
				v-model="searchRoles"
				class="search"
				type="search"
				:placeholder="t('Search Role...')"
				:full-width="false"
			>
				<template #prepend>
					<v-icon name="search" outline />
				</template>
				<template #append>
					<v-icon v-if="searchRoles" clickable class="clear" name="close" @click.stop="searchRoles = null" />
				</template>
			</v-input>

			<v-dialog v-model="confirmDelete" @esc="confirmDelete = false">
				<template #activator="{ on }">
					<v-button v-if="selectedRoles.length" v-tooltip.bottom="t('delete_label')" rounded icon
						class="action-delete" secondary @click="on">
						<v-icon name="delete" />
					</v-button>
				</template>

				<v-card>
					<v-card-title>{{ t('delete_are_you_sure') }}</v-card-title>

					<v-card-actions>
						<v-button secondary @click="confirmDelete = false">
							{{ t('cancel') }}
						</v-button>
						<v-button kind="danger" :loading="deleting" @click="deleteSelectedRoles">
							{{ t('delete_label') }}
						</v-button>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-button v-tooltip.bottom="t('create_role')" rounded icon :to="addNewLink">
				<v-icon name="add" />
			</v-button>
		</template>

		<template #navigation>
			<settings-navigation />
		</template>

		<template #sidebar>
			<sidebar-detail icon="info" :title="t('information')" close>
				<div v-md="t('page_help_settings_roles_collection')" class="page-description" />
			</sidebar-detail>
		</template>

		<div class="roles">
			<v-table
				v-model="selectedRoles"
				v-model:headers="tableHeaders"
				show-resize
				:items="searchRoles ? rolesSearchCopy : roles"
				fixed-header
				item-key="id"
				:loading="loading"
				show-select="multiple"
				@click:row="navigateToRole"
			>
				<template #[`item.icon`]="{ item }">
					<v-icon class="icon" :name="item.icon" :class="{ public: item.public }" />
				</template>

				<template #[`item.name`]="{ item }">
					<v-text-overflow :text="item.name" class="name" :class="{ public: item.public }" />
				</template>

				<template #[`item.count`]="{ item }">
					<value-null v-if="item.public" />
				</template>

				<template #[`item.description`]="{ item }">
					<v-text-overflow :text="item.description" class="description" />
				</template>
			</v-table>
		</div>
		<router-view name="add" />
	</private-view>
</template>

<style lang="scss" scoped>
.header-icon {
	--v-button-color-disabled: var(--theme--primary);
	--v-button-background-color-disabled: var(--theme--primary-background);
	--v-button-background-color-hover-disabled: var(--theme--primary-subdued);
	--v-button-color-hover-disabled: var(--theme--primary);
}

.roles {
	padding: var(--content-padding);
	padding-top: 0;
	padding-bottom: var(--content-padding-bottom);
}

.system {
	--v-icon-color: var(--theme--primary);

	color: var(--theme--primary);
}

.description {
	color: var(--theme--foreground-subdued);
}

.public {
	--v-icon-color: var(--theme--primary);

	color: var(--theme--primary);
}

.v-input.search {
	height: var(--v-button-height);
	--border-radius: calc(44px / 2);
	width: 200px;
	margin-left: auto;

	@media (min-width: 600px) {
		width: 300px;
		margin-top: 0px;
	}
}

.action-delete {
	--v-button-background-color-hover: var(--theme--danger) !important;
	--v-button-color-hover: var(--white) !important;
}
</style>
