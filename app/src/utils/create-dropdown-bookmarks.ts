import { unexpectedError } from '@/utils/unexpected-error';
import { Preset } from '@directus/types';
import { usePresetsStore } from '@/stores/presets';

interface DropdownChoice {
	text: string;
	value: string;
}

// LOGIC FOR CREATING BOOKMARKS FOR SELECTION COMPONENTS WHEN BROWSING COLLS ITEMS
export async function createDropdownBookmarks(
	fieldName: string,
	fieldChoices: DropdownChoice[],
	isShowItemsCount: boolean | null,
	collectionName: string,
	saveCurrentAsBookmark: (overrides: Partial<Preset>) => Promise<any>,
	layoutOptions: Record<string, any>,
	layout: string | null,
	navigateBack: () => void,
) {
	const allCollsBookmarks = usePresetsStore().bookmarks;

	// get the dropdown options for which there are no bookmarks
	const filteredChoices = fieldChoices.filter((choice) => {
		return !allCollsBookmarks.some((b) => b.bookmark === choice.text && b.collection === collectionName);
	});

	try {
		const bookmarkPromises = filteredChoices.map(async ({ text, value }) => {
			return await saveCurrentAsBookmark({
				bookmark: text,
				layout_options: {
					...(layoutOptions ? { [layout || 'tabular']: layoutOptions } : {}),
					show_items_number: isShowItemsCount,
				},
				filter: { _and: [{ [fieldName]: { _eq: value } }] },
			});
		});

		await Promise.all(bookmarkPromises);

		navigateBack();
	} catch (error) {
		unexpectedError(error);
	}
}
