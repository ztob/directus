import { defineDisplay } from '@directus/shared/utils';
import { TYPES } from '@directus/shared/constants';

export default defineDisplay({
	id: 'raw',
	name: '$t:displays.raw.raw',
	icon: 'code',
	handler: (value) => value,
	options: [],
	types: TYPES,
});
