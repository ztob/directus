import { useCollectionsStore } from '@/stores/collections';
import { Ref, ref } from 'vue';

// logic to toggle field types visibility
export function useFieldsTypesVisibility(collection: Ref<string>) {
	const isShowFieldsType = ref<null | boolean>(null);

	const collectionsStore = useCollectionsStore();

	return { isShowFieldsType, setFieldsTypesVisibilityState, toggleFieldsTypeVisibilityState };

	function setFieldsTypesVisibilityState() {
		try {
			const collInfo = collectionsStore.getCollection(collection.value);
			const show_fields_type = collInfo?.meta?.show_fields_type ?? false;

			isShowFieldsType.value = show_fields_type;
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(err);
		}
	}

	async function toggleFieldsTypeVisibilityState(newVisibility: boolean) {
		try {
			isShowFieldsType.value = newVisibility;

			await collectionsStore.updateCollection(collection.value, {
				meta: {
					show_fields_type: newVisibility,
				},
			});
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(err);
		}
	}
}
