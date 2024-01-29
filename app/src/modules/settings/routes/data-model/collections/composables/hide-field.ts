import { useFieldsStore } from '@/stores/fields';

// hide field in collection details
export function hideField(collection: string, field: string) {
	const fieldsStore = useFieldsStore();

	const fieldToHide = fieldsStore.getField(collection, field);
	const isFieldHidden = fieldToHide?.meta?.hidden === true;

	if (isFieldHidden === false) {
		fieldsStore.updateField(collection, field, {
			meta: {
				hidden: true,
			},
		});
	}
}
