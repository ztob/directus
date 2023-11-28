<script setup lang="ts">
import api from '@/api';
import { useCollectionsStore } from '@/stores/collections';
import { unexpectedError } from '@/utils/unexpected-error';
import { Permission, Collection } from '@directus/types';
import { orderBy } from 'lodash';
import { computed, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { appMinimalPermissions, appRecommendedPermissions } from '../../app-permissions';
import PermissionsOverviewHeader from './permissions-overview-header.vue';
import PermissionsOverviewRow from './permissions-overview-row.vue';
import { useNotificationsStore } from '@/stores/notifications';

const props = defineProps<{
	role?: string;
	// the permission row primary key in case we're on the permission detail modal view
	permission?: string;
	appAccess?: boolean;
	isUnusedCollsHidden: boolean
	searchCollections: string | null
}>();

type WatchArguments = [boolean, Permission[], boolean]

const emit = defineEmits(['permission-change']);

const { t } = useI18n();

const collectionsStore = useCollectionsStore();

const notificationsStore = useNotificationsStore();

const { permissions, fetchPermissions, refreshing } = usePermissions();
const { resetActive, resetSystemPermissions, resetting } = useReset();

const regularCollections = computed(() => {
	if(props.searchCollections !== null) {
		return collectionsStore.databaseCollections.filter(coll => coll.collection.toLowerCase().includes(props.searchCollections!))
	}

	// unused collections logic
	return props.isUnusedCollsHidden ? usedRegularCollections.value : collectionsStore.databaseCollections
});

const systemCollections = computed(() => {
	if (props.searchCollections !== null) {
		const searchFilteredColls = collectionsStore.collections.filter(coll => coll.collection.toLowerCase().includes(props.searchCollections!) && isSystemColl(coll))
		return orderBy(searchFilteredColls, 'name')
	}

	// unused collections logic
	const filteredColls = (props.isUnusedCollsHidden ? usedSystemCollections.value : collectionsStore.collections).filter((coll) => isSystemColl(coll))
	return orderBy(filteredColls, 'name')

});

function isSystemColl(coll: Collection) {
	return coll.collection.startsWith('directus_') === true
}

// THE LOGIC FOR HIDING UNUSED COLLECTIONS (all that are - x x x x x)
const usedRegularCollections = ref<Collection[]>([])
const usedSystemCollections = ref<Collection[]>([])
const modifiedPermsSearchedCollsNames = ref<string[]>([]) // ['collection name']

const isPermsFetched = ref(false)
const isUsedCollsCalculated = ref(false)

function filterUnusedSystemColls(permissions: Permission[], collections: Collection[]) {
	return collections.filter(coll => {

		// if the permission is minimal then it should always stay
		const isMinimalPermission = appMinimalPermissions.some(perm => perm.collection === coll.collection)
		if(isMinimalPermission) return true
		if(!isSystemColl(coll)) return false

		return permissions.some(perm => perm.collection === coll.collection)
	})
}

function filterUnusedRegularColls(permissions: Permission[], collections: Collection[]) {
	return collections.filter(coll => permissions.some(perm => perm.collection === coll.collection))
}

watch(() => [props.isUnusedCollsHidden, permissions.value, isPermsFetched.value],
	([_, newPerms, __]: WatchArguments, [___, oldPerms, ____]: WatchArguments) => {
		if (!props.isUnusedCollsHidden) {
			isUsedCollsCalculated.value = false
			return
		}

		// make sure we fetched permissions(we can have them or not)
		if (!isPermsFetched.value) return

		// if reset true then we change system collections only
		if (resetting.value) {
			usedSystemCollections.value = filterUnusedSystemColls(permissions.value, collectionsStore.collections)
			return
		}

		// if perms are modified when searching collections
		if (props.searchCollections !== null) {
			const isPermsAdded = newPerms.length > oldPerms.length
			const isPermsDeleted = newPerms.length < oldPerms.length

			if (isPermsAdded) {
				addPermissionsModifiedFromSearch('add')
			} else if (isPermsDeleted) {
				addPermissionsModifiedFromSearch('delete')
			}

			return
		}

		if (isUsedCollsCalculated.value) return

		usedRegularCollections.value = filterUnusedRegularColls(permissions.value, collectionsStore.databaseCollections)
		usedSystemCollections.value = filterUnusedSystemColls(permissions.value, collectionsStore.collections)

		const dbCollsLength = collectionsStore.databaseCollections.length
		const systemCollsLength = collectionsStore.collections.filter(isSystemColl).length

		const collsHidden = dbCollsLength + systemCollsLength - usedRegularCollections.value.length - usedSystemCollections.value.length
		const collNum = collsHidden > 1 ? 'Collections' : 'Collection'

		notificationsStore.add({
			title: `${collsHidden} Unused ${collNum} Hidden`,
			icon: 'visibility_off',
			type: 'info',
		});

		isUsedCollsCalculated.value = true

		function addPermissionsModifiedFromSearch(action: string) {
			const filterBy = action === 'add' ? newPerms : oldPerms
			const filterFrom = action === 'add' ? oldPerms : newPerms

			const modifiedPerms = filterBy.filter(newP => !filterFrom.some(oldP => newP.id === oldP.id)).map(perm => perm.collection)
			modifiedPermsSearchedCollsNames.value = Array.from(new Set([...modifiedPermsSearchedCollsNames.value, ...modifiedPerms]))
		}
	}, { immediate: true })

watch(() => props.searchCollections, (newSearch, oldSearch) => {
	// add or delete collections if some perms were changed when searching
	if (props.searchCollections === null && modifiedPermsSearchedCollsNames.value.length) {
		modifiedPermsSearchedCollsNames.value.forEach(colName => {
			const isPermExist = permissions.value.some(perm => perm.collection === colName)
			const isSystem = colName.startsWith('directus_') === true

			if (isPermExist) {

				if (isSystem) {
					const isExistInSystem = usedSystemCollections.value.some(col => col.collection === colName)

					if (!isExistInSystem) {
						const collToAdd = collectionsStore.collections.find(col => col.collection === colName)
						usedSystemCollections.value = [...usedSystemCollections.value!, collToAdd!]
					}
				} else {
					const isExistInRegular = usedRegularCollections.value.some(col => col.collection === colName)

					if (!isExistInRegular) {
						const collToAdd = collectionsStore.databaseCollections.find(col => col.collection === colName)
						usedRegularCollections.value = [...usedRegularCollections.value!, collToAdd!]
					}
				}

			} else {

				if (isSystem) {
					usedSystemCollections.value = usedSystemCollections.value.filter(systemCol => {
						const isMinimalCollPermission = appMinimalPermissions.some(perm => perm.collection === colName)
						return isMinimalCollPermission || systemCol.collection !== colName
					})
				} else {
					usedRegularCollections.value = usedRegularCollections.value.filter(perm => perm.collection !== colName)
				}
			}
		})

		modifiedPermsSearchedCollsNames.value = []
	}

	// handle system colls visibility when searching
	if(newSearch?.length && oldSearch?.length) return

	if(newSearch !== null) {
		systemVisible.value = true
	} else {
		systemVisible.value = lastSystemVisibleState.value
	}
})
// ---------------------------------------

const systemVisible = ref(false);
const lastSystemVisibleState = ref(false)

function onSystemColsVisibillityBtn() {
	systemVisible.value = !systemVisible.value
	lastSystemVisibleState.value = systemVisible.value
}

watch(() => props.permission, fetchPermissions, { immediate: true });

provide('refresh-permissions', fetchPermissions);

function usePermissions() {
	const permissions = ref<Permission[]>([]);
	const loading = ref(false);
	const refreshing = ref<number[]>([]);

	return { permissions, loading, fetchPermissions, refreshPermission, refreshing };

	async function fetchPermissions() {
		loading.value = true;

		try {
			const params: any = { filter: { role: {} } };

			if (props.role === null) {
				params.filter.role = { _null: true };
			} else {
				params.filter.role = { _eq: props.role };
			}

			const response = await api.get('/permissions', { params });
			permissions.value = response.data.data;

			// make sure we fetched permissions
			if(!isPermsFetched.value) {
				isPermsFetched.value = true
			}

			emit('permission-change', response.data.data);
		} catch (err: any) {
			unexpectedError(err);
		} finally {
			loading.value = false;
		}
	}

	async function refreshPermission(id: number) {
		if (refreshing.value.includes(id) === false) {
			refreshing.value.push(id);
		}

		try {
			const response = await api.get(`/permissions/${id}`);

			permissions.value = permissions.value.map((permission) => {
				if (permission.id === id) return response.data.data;
				return permission;
			});
		} catch (err: any) {
			unexpectedError(err);
		} finally {
			refreshing.value = refreshing.value.filter((inProgressID) => inProgressID !== id);
		}
	}
}

function useReset() {
	const resetActive = ref<string | boolean>(false);
	const resetting = ref(false);
	const resetError = ref<any>(null);

	return { resetActive, resetSystemPermissions, resetting, resetError };

	async function resetSystemPermissions(useRecommended: boolean) {
		resetting.value = true;

		const toBeDeleted = permissions.value
			.filter((permission) => permission.collection.startsWith('directus_'))
			.map((permission) => permission.id);

		try {
			if (toBeDeleted.length > 0) {
				await api.delete(`/permissions`, { data: toBeDeleted });
			}

			if (props.role !== null && props.appAccess === true && useRecommended === true) {
				await api.post(
					'/permissions',
					appRecommendedPermissions.map((permission) => ({
						...permission,
						role: props.role,
					}))
				);
			}

			await fetchPermissions();

			resetActive.value = false;
		} catch (err: any) {
			resetError.value = err;
		} finally {
			resetting.value = false;
		}
	}
}
</script>

<template>
	<div class="permissions-overview">
		<h2 class="title type-label">
			{{ t('permissions') }}
			<span class="instant-save">{{ t('saves_automatically') }}</span>
		</h2>

		<div class="table">
			<permissions-overview-header />

			<permissions-overview-row
				v-for="collection in regularCollections"
				:key="collection.collection"
				:collection="collection"
				:role="role"
				:permissions="permissions.filter((p) => p.collection === collection.collection)"
				:refreshing="refreshing"
			/>

			<button class="system-toggle" @click="onSystemColsVisibillityBtn">
				{{ t('system_collections') }}
				<v-icon :name="systemVisible ? 'expand_less' : 'expand_more'" />
			</button>

			<transition-expand>
				<div v-if="systemVisible">
					<permissions-overview-row
						v-for="collection in systemCollections"
						:key="collection.collection"
						:collection="collection"
						:role="role"
						:permissions="permissions.filter((p) => p.collection === collection.collection)"
						:refreshing="refreshing"
						:app-minimal="appAccess && appMinimalPermissions.filter((p) => p.collection === collection.collection)"
					/>
				</div>
			</transition-expand>

			<span v-if="systemVisible && appAccess" class="reset-toggle">
				{{ t('reset_system_permissions_to') }}
				<button @click="resetActive = 'minimum'">{{ t('app_access_minimum') }}</button>
				/
				<button @click="resetActive = 'recommended'">{{ t('recommended_defaults') }}</button>
			</span>
		</div>

		<router-view name="permissionsDetail" :role-key="role" :permission-key="permission" />

		<v-dialog :model-value="!!resetActive" @update:model-value="resetActive = false" @esc="resetActive = false">
			<v-card>
				<v-card-title>
					{{ t('reset_system_permissions_copy') }}
				</v-card-title>
				<v-card-actions>
					<v-button secondary @click="resetActive = false">{{ t('cancel') }}</v-button>
					<v-button :loading="resetting" @click="resetSystemPermissions(resetActive === 'recommended')">
						{{ t('reset') }}
					</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<style lang="scss" scoped>
.permissions-overview {
	position: relative;
}

.title {
	margin-bottom: 12px;

	.instant-save {
		margin-left: 4px;
		color: var(--warning);
	}
}

.table {
	max-width: 792px;
	background-color: var(--background-input);
	border: var(--border-width) solid var(--border-normal);
	border-radius: var(--border-radius);
}

.system-toggle {
	width: 100%;
	height: 48px;
	color: var(--foreground-subdued);
	background-color: var(--background-subdued);

	.v-icon {
		vertical-align: -7px;
	}
}

.reset-toggle {
	display: block;
	margin: 8px auto;
	color: var(--foreground-subdued);
	text-align: center;

	button {
		color: var(--primary) !important;
		transition: color var(--fast) var(--transition);
	}

	button:hover {
		color: var(--foreground-normal) !important;
	}
}
</style>
