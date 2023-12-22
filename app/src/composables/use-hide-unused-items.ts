import { Ref, computed, onMounted, ref, watch } from 'vue';
import api from '@/api';
import { useFieldsStore } from '@/stores/fields';
import { useNotificationsStore } from '@/stores/notifications';
import { useCollectionsStore } from '@/stores/collections';
import { Collection } from '@/types/collections';
import { Permission } from '@directus/types';

// LOGIC TO TOGGLE(!) UNUSED ITEMS BOTH IN WEBHOOKS(COLLECTIONS) AND ROLES(COLLECTIONS WITH PERMISSIONS)
export function useHideUnusedItemsSwitcher(isItemBeingCreated: () => boolean, url: string) {
	const isUnusedItemsHidden = ref<boolean | null>(null);
	const searchItems = ref<string | null>(null);

	onMounted(async () => {
		try {
			// if webhook is being created then there is no abillity to hide unused colls
			if (isItemBeingCreated()) {
				return;
			}

			const { data } = await api.get(url);

			isUnusedItemsHidden.value = data.data.hide_unused_colls;
		} catch (error) {
			console.log(error);
		}
	});

	return { isUnusedItemsHidden, searchItems, hideUnusedItemsToggle };

	async function hideUnusedItemsToggle() {
		isUnusedItemsHidden.value = !isUnusedItemsHidden.value;

		try {
			const { data } = await api.patch(url, {
				hide_unused_colls: isUnusedItemsHidden.value,
			});

			// set isUnusedCollsHidden to make sure the value is the same as it is in DB
			isUnusedItemsHidden.value = data.data.hide_unused_colls;
		} catch (error) {
			console.log(error);
		}
	}
}

// LOGIC TO HIDE UNUSED COLLS BOOLEAN FIELD FROM BOTH WEBHOOKS AND ROLES FORMS
export function hideFormUnusedItemsField(collection: string, field: string) {
	const fieldsStore = useFieldsStore();

	onMounted(() => {
		const hideUnusedField = fieldsStore.getField(collection, field);
		const isHideUnusedFieldHidden = hideUnusedField?.meta?.hidden === true;

		if (isHideUnusedFieldHidden === false) {
			fieldsStore.updateField(collection, field, {
				meta: {
					hidden: true,
				},
			});
		}
	});
}

// LOGIC TO EXACTLY HIDE UNUSED COLLS IN WEBHOOKS (all that are unchecked)
interface MapPairsForColl {
	text: string;
	value: string;
}

export function useHideUnusedCollsInWebhooks(
	allCollections: Ref<Collection[]>,
	tickedCollections: Ref<Readonly<string[] | null>>,
	currentCollectionName: Ref<Readonly<string>>,
	mapPairsForColl: (colls: Collection[]) => MapPairsForColl[],
	isCollsHidden?: Ref<Readonly<boolean | null | undefined>>,
	searchCollsValue?: Ref<Readonly<string | null | undefined>>,
) {
	const modifiedCollsFromSearch = ref<string[]>([]); // ['collection name']
	const usedCollections = ref<Collection[]>([]);
	const isUsedCollsCalculated = ref(false);

	const collectionsRef = ref<HTMLElement | null>(null);

	const notificationsStore = useNotificationsStore();

	type WatchArgumentsWebhooks = [string[] | null, boolean | null];

	watch(
		() => [tickedCollections.value, isCollsHidden?.value],
		// @ts-ignore
		(
			[newTickedColls, newHidden]: WatchArgumentsWebhooks = [],
			[oldTickedColls, oldHidden]: WatchArgumentsWebhooks = [],
		) => {
			// make sure this logic would work only for directus_webhooks coll
			if (!currentCollectionName.value || currentCollectionName.value !== 'directus_webhooks') return;

			// make sure we fetched the webhooks and value & isUnusedCollsHidden !== null
			if (!tickedCollections.value) return;

			if (!isCollsHidden?.value) {
				isUsedCollsCalculated.value = false;
				return;
			}

			// if colls are (un)checked when searching collections
			if (searchCollsValue!.value !== null) {
				// @ts-ignore
				const isCollsAdded = newTickedColls?.length > oldTickedColls?.length;
				// @ts-ignore
				const isCollsDeleted = newTickedColls?.length < oldTickedColls?.length;

				if (isCollsAdded) {
					addCollsModifiedFromSearch('add');
				} else if (isCollsDeleted) {
					addCollsModifiedFromSearch('delete');
				}

				return;
			}

			if (isUsedCollsCalculated.value) return;

			usedCollections.value = allCollections.value.filter((coll) =>
				tickedCollections.value!.some((collName) => coll.collection === collName),
			);

			const collsHiddenNum = allCollections.value.length - usedCollections.value.length;
			const collWord = collsHiddenNum > 1 ? 'Collections' : 'Collection';

			notificationsStore.add({
				title: `${collsHiddenNum} Unused ${collWord} Hidden`,
				icon: 'visibility_off',
				type: 'info',
			});

			const isShouldScroll = oldHidden === false && newHidden === true;

			// scroll only when user toggles the hide btn to enabled
			if (isShouldScroll) {
				collectionsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}

			isUsedCollsCalculated.value = true;

			function addCollsModifiedFromSearch(action: string) {
				const filterBy = action === 'add' ? (newTickedColls as string[]) : (oldTickedColls as string[]);
				const filterFrom = action === 'add' ? (oldTickedColls as string[]) : (newTickedColls as string[]);

				const modifiedColls = filterBy.filter((newColl: any) => !filterFrom.some((oldColl) => newColl === oldColl));

				modifiedCollsFromSearch.value = Array.from(new Set([...modifiedCollsFromSearch.value, ...modifiedColls]));
			}
		},
		{ immediate: true },
	);

	watch(
		() => searchCollsValue!.value,
		() => {
			// add or delete collections that were changed when searching
			if (searchCollsValue!.value === null && modifiedCollsFromSearch.value.length) {
				modifiedCollsFromSearch.value.forEach((collName) => {
					const isCurrentlyActive = tickedCollections.value!.some((_collName) => _collName === collName);

					if (isCurrentlyActive) {
						const isExistInUsed = usedCollections.value.some((col) => col.name === collName);

						if (!isExistInUsed) {
							const collToAdd = allCollections.value.find((col) => col.collection === collName);

							if (collToAdd) {
								usedCollections.value = [...usedCollections.value, collToAdd!];
							}
						}
					} else {
						usedCollections.value = usedCollections.value.filter((coll) => coll.collection !== collName);
					}
				});

				modifiedCollsFromSearch.value = [];
			}

			collectionsRef.value?.scrollIntoView();
		},
	);

	const isHideCollsAllowed = computed(
		() => isCollsHidden?.value && currentCollectionName.value === 'directus_webhooks',
	);

	return { usedCollections, collectionsRef, isHideCollsAllowed, searchCollectionsFunc };

	function searchCollectionsFunc() {
		return mapPairsForColl(allCollections.value).filter((coll) =>
			coll.text.toLowerCase().includes(searchCollsValue!.value!.toLowerCase()),
		);
	}
}

// LOGIC TO EXACTLY HIDE UNUSED COLLS IN ROLES (all that are - x x x x x)
type WatchArgumentsRoles = [boolean, Permission[], boolean];

export function useHideUnusedCollsInRoles(
	isUnusedCollsHidden: Ref<Readonly<boolean>>,
	permissions: Ref<Permission[]>,
	resetting: Ref<boolean>,
	searchCollections: Ref<Readonly<string | null>>,
	isSystemColl: (coll: Collection) => boolean,
	appMinimalPermissions: Partial<Permission>[],
) {
	const usedRegularCollections = ref<Collection[]>([]);
	const usedSystemCollections = ref<Collection[]>([]);
	const modifiedPermsSearchedCollsNames = ref<string[]>([]); // ['collection name']
	const isPermsFetched = ref(false);
	const isUsedCollsCalculated = ref(false);
	const systemVisible = ref(false);
	const lastSystemVisibleState = ref(false);

	const collectionsStore = useCollectionsStore();
	const notificationsStore = useNotificationsStore();

	watch(
		() => [isUnusedCollsHidden.value, permissions.value, isPermsFetched.value],
		([_, newPerms, __]: WatchArgumentsRoles, [___, oldPerms, ____]: WatchArgumentsRoles) => {
			if (!isUnusedCollsHidden.value) {
				isUsedCollsCalculated.value = false;
				return;
			}

			// make sure we fetched permissions(we can have them or not)
			if (!isPermsFetched.value) return;

			// if reset true then we change system collections only
			if (resetting.value) {
				usedSystemCollections.value = filterUnusedSystemColls(permissions.value, collectionsStore.collections);
				return;
			}

			// if perms are modified when searching collections
			if (searchCollections.value !== null) {
				const isPermsAdded = newPerms.length > oldPerms.length;
				const isPermsDeleted = newPerms.length < oldPerms.length;

				if (isPermsAdded) {
					addPermissionsModifiedFromSearch('add');
				} else if (isPermsDeleted) {
					addPermissionsModifiedFromSearch('delete');
				}

				return;
			}

			if (isUsedCollsCalculated.value) return;

			usedRegularCollections.value = filterUnusedRegularColls(permissions.value, collectionsStore.databaseCollections);
			usedSystemCollections.value = filterUnusedSystemColls(permissions.value, collectionsStore.collections);

			const dbCollsLength = collectionsStore.databaseCollections.length;
			const systemCollsLength = collectionsStore.collections.filter(isSystemColl).length;

			const collsHidden =
				dbCollsLength + systemCollsLength - usedRegularCollections.value.length - usedSystemCollections.value.length;

			const collNum = collsHidden > 1 ? 'Collections' : 'Collection';

			notificationsStore.add({
				title: `${collsHidden} Unused ${collNum} Hidden`,
				icon: 'visibility_off',
				type: 'info',
			});

			isUsedCollsCalculated.value = true;

			function addPermissionsModifiedFromSearch(action: string) {
				const filterBy = action === 'add' ? newPerms : oldPerms;
				const filterFrom = action === 'add' ? oldPerms : newPerms;

				const modifiedPerms = filterBy
					.filter((newP) => !filterFrom.some((oldP) => newP.id === oldP.id))
					.map((perm) => perm.collection);

				modifiedPermsSearchedCollsNames.value = Array.from(
					new Set([...modifiedPermsSearchedCollsNames.value, ...modifiedPerms]),
				);
			}
		},
		{ immediate: true },
	);

	watch(
		() => searchCollections.value,
		(newSearch, oldSearch) => {
			// add or delete collections if some perms were changed when searching
			if (searchCollections.value === null && modifiedPermsSearchedCollsNames.value.length) {
				modifiedPermsSearchedCollsNames.value.forEach((colName) => {
					const isPermExist = permissions.value.some((perm) => perm.collection === colName);
					const isSystem = colName.startsWith('directus_') === true;

					if (isPermExist) {
						if (isSystem) {
							const isExistInSystem = usedSystemCollections.value.some((col) => col.collection === colName);

							if (!isExistInSystem) {
								const collToAdd = collectionsStore.collections.find((col) => col.collection === colName);
								usedSystemCollections.value = [...usedSystemCollections.value!, collToAdd!];
							}
						} else {
							const isExistInRegular = usedRegularCollections.value.some((col) => col.collection === colName);

							if (!isExistInRegular) {
								const collToAdd = collectionsStore.databaseCollections.find((col) => col.collection === colName);
								usedRegularCollections.value = [...usedRegularCollections.value!, collToAdd!];
							}
						}
					} else {
						if (isSystem) {
							usedSystemCollections.value = usedSystemCollections.value.filter((systemCol) => {
								const isMinimalCollPermission = appMinimalPermissions.some((perm) => perm.collection === colName);
								return isMinimalCollPermission || systemCol.collection !== colName;
							});
						} else {
							usedRegularCollections.value = usedRegularCollections.value.filter((perm) => perm.collection !== colName);
						}
					}
				});

				modifiedPermsSearchedCollsNames.value = [];
			}

			// handle system colls visibility when searching
			if (newSearch?.length && oldSearch?.length) return;

			if (newSearch !== null) {
				systemVisible.value = true;
			} else {
				systemVisible.value = lastSystemVisibleState.value;
			}
		},
	);

	return {
		usedRegularCollections,
		usedSystemCollections,
		isPermsFetched,
		systemVisible,
		lastSystemVisibleState,
		searchRegularColls,
		searchSystemColls,
	};

	function filterUnusedSystemColls(permissions: Permission[], collections: Collection[]) {
		return collections.filter((coll) => {
			// if the permission is minimal then it should always stay
			const isMinimalPermission = appMinimalPermissions.some((perm) => perm.collection === coll.collection);
			if (isMinimalPermission) return true;
			if (!isSystemColl(coll)) return false;

			return permissions.some((perm) => perm.collection === coll.collection);
		});
	}

	function filterUnusedRegularColls(permissions: Permission[], collections: Collection[]) {
		return collections.filter((coll) => permissions.some((perm) => perm.collection === coll.collection));
	}

	function searchRegularColls() {
		return collectionsStore.databaseCollections.filter((coll) =>
			coll.collection.toLowerCase().includes(searchCollections.value!),
		);
	}

	function searchSystemColls() {
		return collectionsStore.collections.filter(
			(coll) => coll.collection.toLowerCase().includes(searchCollections.value!) && isSystemColl(coll),
		);
	}
}
