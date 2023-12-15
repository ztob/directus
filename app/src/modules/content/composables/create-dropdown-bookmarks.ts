import { unexpectedError } from '@/utils/unexpected-error';
import { Preset } from '@directus/types';

interface DropdownChoice {
	text: string;
	value: string;
}

// LOGIC FOR CREATING BOOKMARKS FOR SELECT_DROPDOWN

export async function createDropdownBookmarks(
	dropdownName: string,
	dropdownChoices: DropdownChoice[],
	saveCurrentAsBookmark: (overrides: Partial<Preset>) => Promise<any>,
	layoutOptions: Record<string, any>,
	layout: string | null,
	navigateBack: () => void,
) {
	try {
		const bookmarkPromises = dropdownChoices!.map(async ({ text, value }) => {
			return await saveCurrentAsBookmark({
				bookmark: text,
				layout_options: {
					...(layoutOptions ? { [layout || 'tabular']: layoutOptions } : {}),
					show_items_number: true,
				},
				filter: { _and: [{ [dropdownName]: { _eq: value } }] },
			});
		});

		await Promise.all(bookmarkPromises);

		navigateBack();
	} catch (error) {
		unexpectedError(error);
	}
}
