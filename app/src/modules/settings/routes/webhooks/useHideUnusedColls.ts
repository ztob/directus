import { ref, watch, Ref } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import { Collection } from '@/types/collections';

// THE LOGIC TO HIDE UNUSED COLLS IN DIRECTUS_WEBHOOKS
export function useHideUnusedColls(
	allCollections: Ref<Readonly<Collection[]>>,
	tickedCollections: Ref<Readonly<string[] | null>>,
	currentCollectionName: Ref<Readonly<string>>,
	collectionsRef: Ref<Readonly<HTMLElement | null>>,
	isCollsHidden?: Ref<Readonly<boolean | null>>,
	searchCollsValue?: Ref<Readonly<string | null>>,
) {
	const modifiedCollsFromSearch = ref<string[]>([]); // ['collection name']
	const usedCollections = ref<Collection[]>([]);
	const isUsedCollsCalculated = ref(false);

	const notificationsStore = useNotificationsStore();

	type WatchArguments = [string[] | null, boolean | null];

	watch(
		() => [tickedCollections.value, isCollsHidden!.value],
		// @ts-ignore
		([newTickedColls, newHidden]: WatchArguments = [], [oldTickedColls, oldHidden]: WatchArguments = []) => {
			// make sure this logic would work only for directus_webhooks coll
			if (!currentCollectionName.value || currentCollectionName.value !== 'directus_webhooks') return;

			// make sure we fetched the webhooks and value & isUnusedCollsHidden !== null
			if (!tickedCollections.value) return;

			if (!isCollsHidden!.value) {
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

	return { usedCollections };
}
