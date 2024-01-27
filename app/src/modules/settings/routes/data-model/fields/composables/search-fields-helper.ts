import { Field } from '@directus/types';

// search fields by name or type
export function searchFieldsHelper(fields: Field[], search: string): Field[] {
	return fields.filter(
		(field) =>
			field.name.toLowerCase().includes(search.toLowerCase().trim()) ||
			field.type.toLowerCase().includes(search.toLowerCase().trim()),
	);
}
