export interface FilterField {
	[key: string]: any;
	$_disabled_$?: {
		_eq: boolean;
	};
}

// LOGIC TO REMOVE FILTER OBJECTS THAT HAVE $_disabled_$ PROP
export function removeFilterDisabledFields(filter: FilterField | null | undefined) {
	if (typeof filter === 'object') {
		if (Array.isArray(filter)) {
			for (let i = filter.length - 1; i >= 0; i--) {
				const element = filter[i];
				removeFilterDisabledFields(element);

				if (JSON.stringify(element) === '{}') {
					// if(!Object.keys(element).length) {
					// Check if the element is an empty object
					filter.splice(i, 1);
				}
			}
		} else {
			for (const key in filter) {
				if (filter.hasOwnProperty(key)) {
					const value: any = filter[key];
					removeFilterDisabledFields(value);

					if (key === '_and' && value.some((subObj: FilterField) => subObj.$_disabled_$)) {
						// Delete the entire object
						delete filter[key];
					}
				}
			}
		}
	}
}
