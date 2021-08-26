import { Language } from '@/lang';
import { setLanguage } from '@/lang/set-language';
import { register as registerModules, unregister as unregisterModules } from '@/modules/register';
import {
	useAppStore,
	useCollectionsStore,
	useFieldsStore,
	useLatencyStore,
	usePermissionsStore,
	usePresetsStore,
	useRelationsStore,
	useRequestsStore,
	useServerStore,
	useSettingsStore,
	useUserStore,
} from '@/stores';

type GenericStore = {
	$id: string;
	hydrate?: () => Promise<void>;
	dehydrate?: () => Promise<void>;

	[key: string]: any;
};

export function useStores(
	stores = [
		useCollectionsStore,
		useFieldsStore,
		useUserStore,
		useRequestsStore,
		usePresetsStore,
		useSettingsStore,
		useServerStore,
		useLatencyStore,
		useRelationsStore,
		usePermissionsStore,
	]
): GenericStore[] {
	return stores.map((useStore) => useStore()) as GenericStore[];
}

export async function hydrate(stores = useStores()): Promise<void> {
	const appStore = useAppStore();
	const userStore = useUserStore();

	if (appStore.hydrated) return;
	if (appStore.hydrating) return;

	appStore.hydrating = true;

	try {
		/**
		 * @NOTE
		 * Multiple stores rely on the userStore to be set, so they can fetch user specific data. The
		 * following makes sure that the user store is always fetched first, before we hydrate anything
		 * else.
		 */
		await userStore.hydrate();

		if (userStore.currentUser?.role) {
			await Promise.all(stores.filter(({ $id }) => $id !== 'userStore').map((store) => store.hydrate?.()));
			await registerModules();
			await setLanguage((userStore.currentUser?.language as Language) || 'en-US');
		}
	} catch (error) {
		appStore.error = error;
	} finally {
		appStore.hydrating = false;
	}

	appStore.hydrated = true;
}

export async function dehydrate(stores = useStores()): Promise<void> {
	const appStore = useAppStore();

	if (appStore.hydrated === false) return;

	for (const store of stores) {
		await store.dehydrate?.();
	}

	unregisterModules();

	appStore.hydrated = false;
}
