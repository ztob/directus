<script setup lang="ts">
import { useEditsGuard } from '@/composables/use-edits-guard';
import { useItem } from '@/composables/use-item';
import { useShortcut } from '@/composables/use-shortcut';
import { usePermissionsStore } from '@/stores/permissions';
import { useServerStore } from '@/stores/server';
import { useUserStore } from '@/stores/user';
import RevisionsDrawerDetail from '@/views/private/components/revisions-drawer-detail.vue';
import UsersInvite from '@/views/private/components/users-invite.vue';
import { computed, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import SettingsNavigation from '../../../components/navigation.vue';
import HideUnusedAndSearch from '../../../components/hide-unused-and-search.vue'
import PermissionsOverview from './components/permissions-overview.vue';
import RoleInfoSidebarDetail from './components/role-info-sidebar-detail.vue';
import ModulePermissions from './components/module-permissions.vue';
import SaveOptions from '@/views/private/components/save-options.vue';
import api from '@/api';
import { unexpectedError } from '@/utils/unexpected-error';
import { Permission } from '@directus/types';
import { useSettingsStore } from '@/stores/settings';
import { ModuleBarItem, PreviewExtra } from './types';
import { useHideUnusedItemsSwitcher } from '@/composables/use-hide-unused-items';

const props = defineProps<{
	primaryKey: string;
	permissionKey?: string;
	lastAdminRoleId?: string;
}>();

const { t } = useI18n();

const router = useRouter();

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const permissionsStore = usePermissionsStore();
const serverStore = useServerStore();
const userInviteModalActive = ref(false);
const { primaryKey } = toRefs(props);

const revisionsDrawerDetailRef = ref<InstanceType<typeof RevisionsDrawerDetail> | null>(null);

const { edits, hasEdits, item, saving, loading, save, remove, deleting } = useItem(ref('directus_roles'), primaryKey, {
	deep: { users: { _limit: 0 } },
});

const confirmDelete = ref(false);

const adminEnabled = computed(() => {
	const values = {
		...item.value,
		...edits.value,
	} as Record<string, any>;

	return !!values.admin_access;
});

const appAccess = computed(() => {
	const values = {
		...item.value,
		...edits.value,
	} as Record<string, any>;

	return !!values.app_access;
});

useShortcut('meta+s', () => {
	if (hasEdits.value) saveAndStay();
});

const { confirmLeave, leaveTo } = useEditsGuard(hasEdits);

const canInviteUsers = computed(() => {
	if (serverStore.auth.disableDefault === true) return false;

	const isAdmin = !!userStore.currentUser?.role?.admin_access;
	if (isAdmin) return true;

	const usersCreatePermission = permissionsStore.permissions.find(
		(permission) => permission.collection === 'directus_users' && permission.action === 'create',
	);

	const rolesReadPermission = permissionsStore.permissions.find(
		(permission) => permission.collection === 'directus_roles' && permission.action === 'read',
	);

	return !!usersCreatePermission && !!rolesReadPermission;
});

/**
 * @NOTE
 * The userStore contains the information about the role of the current user. We want to
 * update the userstore to make sure the role information is accurate with the latest changes
 * in case we're changing the current user's role
 */

async function saveAndStay() {
	await save();
	await userStore.hydrate();
	revisionsDrawerDetailRef.value?.refresh?.();
}

async function saveAndQuit() {
	await save();
	await userStore.hydrate();
	router.push(`/settings/roles`);
}

async function deleteAndQuit() {
	await remove();
	edits.value = {};
	router.replace(`/settings/roles`);
}

function discardAndLeave() {
	if (!leaveTo.value) return;
	edits.value = {};
	confirmLeave.value = false;
	router.push(leaveTo.value);
}

// LOGIC TO CREATE ROLE COPY
const disabledOptions = ['save-and-stay', 'save-and-add-new', 'discard-and-stay'];

interface ModuleSettings extends ModuleBarItem, PreviewExtra {
	allowed: boolean
	icon: string // override the type for icon prop
}

interface Item {
	id: string,
	[key: string]: any
}

const permissions = ref<Permission[]>([])
const moduleSettings = ref<ModuleSettings[]>([])

async function saveAsCopy() {
	const { name } = {
		...item.value,
		...edits.value,
	} as Record<string, any>;

	const { id, ..._item } = item.value as Item
	const _edits = edits.value

	if (_edits.users) {
		delete _edits.users
	}

	try {
		saving.value = true;

		const roleResponse = await api.post('/roles', {
			name,
			admin_access: adminEnabled.value,
			app_access: appAccess.value,
			..._item,
			..._edits,
		});

		const newRoledId = roleResponse.data.data.id

		if (appAccess.value === true && adminEnabled.value === false) {
			await api.post(
				'/permissions',
				permissions.value.map(({ id, ...permission }) => ({
					...permission,
					role: newRoledId,
				}))
			);
		}

		settingsStore.updateSettings({
			module_bar: moduleSettings.value.map((module) => {

				let disallowed_roles = module.disallowed_roles ?? [];

				if (!module.allowed) {
					disallowed_roles = disallowed_roles.concat(newRoledId);

					return {
						...module,
						disallowed_roles,
					};
				}

				return module;
			}),
		});

		edits.value = {};
		router.push(`/settings/roles/${newRoledId}`);
	} catch (err: any) {
		unexpectedError(err);
	} finally {
		saving.value = false;
	}
}

// LOGIC FOR HIDING UNUSED COLLECTIONS (all that are - x x x x x)
const {
	isUnusedItemsHidden: isUnusedCollsHidden,
	searchItems: searchCollections,
	hideUnusedItemsToggle: hideUnusedCollsToggle
} = useHideUnusedItemsSwitcher(
	() => false,
	`/roles/${primaryKey.value}`
)
</script>

<template>
	<private-view :title="loading ? t('loading') : t('editing_role', { role: item && item.name })"
		:is_prevent_main_content_scroll="true">
		<template #headline>
			<v-breadcrumb :items="[{ name: t('settings_permissions'), to: '/settings/roles' }]" />
		</template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded icon exact :to="`/settings/roles/`">
				<v-icon name="arrow_back" />
			</v-button>
		</template>
		<template #actions>

			<!-- LOGIC TO HIDE UNUSED COLLECTIONS AND SEARCH FOR COLLS  -->
			<HideUnusedAndSearch
				v-model:search-val="searchCollections"
				:is-unused-colls-hidden="isUnusedCollsHidden"
				@hide-unused-toggle="hideUnusedCollsToggle"
			/>
			<!------------------------------------------- -->

			<v-dialog v-if="[1, 2].includes(+primaryKey) === false" v-model="confirmDelete" @esc="confirmDelete = false">
				<template #activator="{ on }">
					<v-button v-if="primaryKey !== lastAdminRoleId" v-tooltip.bottom="t('delete_label')" rounded icon
						class="action-delete" secondary :disabled="item === null" @click="on">
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

			<v-button v-if="canInviteUsers" v-tooltip.bottom="t('invite_users')" rounded icon secondary
				@click="userInviteModalActive = true">
				<v-icon name="person_add" />
			</v-button>

			<v-button v-tooltip.bottom="t('save')" rounded icon :loading="saving" :disabled="hasEdits === false"
				@click="saveAndQuit">
				<v-icon name="check" />
				<template #append-outer>
					<save-options v-if="hasEdits === true" :disabled-options="disabledOptions" @save-as-copy="saveAsCopy" />
				</template>
			</v-button>

		</template>

		<template #navigation>
			<settings-navigation />
		</template>

		<users-invite v-model="userInviteModalActive" :role="primaryKey" />

		<div class="roles">
			<v-notice v-if="adminEnabled">
				{{ t('admins_have_all_permissions') }}
			</v-notice>

			<!-- permissions for collections -->
			<div v-else>
				<v-progress-linear v-if="isUnusedCollsHidden === null" colorful indeterminate value="70"/>
				<permissions-overview
					v-else
					:role="primaryKey"
					:permission="permissionKey"
					:app-access="appAccess"
					:is-unused-colls-hidden="isUnusedCollsHidden"
					:search-collections="searchCollections"
					@permission-change="permissions = $event"
				/>
			</div>

			<v-form v-model="edits" collection="directus_roles" :primary-key="primaryKey" :loading="loading"
				:initial-values="item" />

			<!-- Control which modules are accessible for this role -->
			<module-permissions :role-id="primaryKey" @module-settings-change="moduleSettings = $event" />
		</div>

		<template #sidebar>
			<role-info-sidebar-detail :role="item" />
			<revisions-drawer-detail ref="revisionsDrawerDetailRef" collection="directus_roles" :primary-key="primaryKey" />
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
.action-delete {
	--v-button-background-color-hover: var(--theme--danger) !important;
	--v-button-color-hover: var(--white) !important;
}

.roles {
	padding: var(--content-padding);
	padding-bottom: var(--content-padding-bottom);
}

.v-notice,
.v-skeleton-loader {
	max-width: 800px;
}

.header-icon {
	--v-button-background-color: var(--theme--primary-background);
	--v-button-color: var(--theme--primary);
	--v-button-background-color-hover: var(--theme--primary-subdued);
	--v-button-color-hover: var(--theme--primary);
}

.permissions-overview,
.roles .v-notice {
	margin-bottom: 48px;
}
</style>
