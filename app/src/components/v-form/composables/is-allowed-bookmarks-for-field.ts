import { Type } from '@directus/types';

const bookmarksFromInterfaces = [
	{ 'select-dropdown': true },
	{ 'select-multiple-checkbox': true, type: 'csv' },
	{ 'select-multiple-dropdown': true, type: 'csv' },
	{ 'select-radio': true },
	{ 'select-multiple-checkbox-tree': true, type: 'csv' },
];

// LOGIC FOR CREATING BOOKMARKS FOR SELECTION COMPONENTS WHEN BROWSING COLLS ITEMS

export function isAllowedBookmarksForField(fieldInterface: string | null | undefined, fieldType: Type) {
	const allowedInterface = bookmarksFromInterfaces.find((interfaceObj) => interfaceObj[fieldInterface]);

	if (!allowedInterface) return false;

	const isAllowedByType = !allowedInterface.type || allowedInterface.type === fieldType;

	if (isAllowedByType) return true;

	return false;
}
