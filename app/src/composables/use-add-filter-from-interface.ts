import { Filter } from '@directus/types';
import { WritableComputedRef, ref, watch } from 'vue';

interface AddFilterArgs {
	field: string;
	value: string | number | boolean;
}

export function useAddFilterFromInterface(
	filter: WritableComputedRef<Filter | null | undefined>,
	goBack: (isWait?: boolean) => void,
) {
	const isFilterLoading = ref('');

	window.addFilterFromInterface = (newFilter: any) => {
		if (!filter.value) {
			filter.value = {
				_and: [newFilter],
			};
		} else {
			const isFilterExists = filter.value._and.find((f: Filter) => {
				for (const key in f) {
					if (key in newFilter && JSON.stringify(f[key]) === JSON.stringify(newFilter[key])) return true;
				}

				return false;
			});

			if (isFilterExists) {
				goBack(false);
				isFilterLoading.value = '';
				return;
			}

			filter.value = {
				_and: [...filter.value._and, newFilter],
			};
		}
	};

	watch(filter, () => {
		goBack();
		setTimeout(() => isFilterLoading.value = '', 900)
	});

	return { isFilterLoading, onAddFilter };

	function onAddFilter(filterData: AddFilterArgs) {
		const { field, value } = filterData;

		isFilterLoading.value = field;

		const newFilter = {
			[field]: value !== null ? { _eq: value } : { _null: '' },
		};

		window.addFilterFromInterface(newFilter);
	}
}
