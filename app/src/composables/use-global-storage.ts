import api from '@/api';
import { GlobalItem } from '@/types/global-item';
import { getEndpoint } from '@directus/utils';
import { ref } from 'vue';

export function useGlobalStorage(url: string) {
	const globalStorage = ref<GlobalItem[]>([]);
	const globalsLoading = ref(false);

	return { globalStorage, globalsLoading, getStorageItems };

	async function getStorageItems() {
		try {
			globalsLoading.value = true;

			const { data } = await api.get(getEndpoint(url), {
				params: {
					filter: { _and: [{ status: { _eq: 'published' } }] },
				},
			});

			const globalItems: Record<string, any>[] = data.data;

			globalStorage.value = globalItems.map(({ key, value }) => ({ key, value }));
		} catch (error) {
			console.log(error);
		} finally {
			globalsLoading.value = false;
		}
	}
}
