import { defineHook } from '@directus/extension-sdk';

export default defineHook(() => ({
	'items.create': () => {
		console.log('Item created!');
	},
}));
