import { defineInterface } from '@directus/shared/utils';
import InterfaceSelectIcon from './select-icon.vue';

export default defineInterface({
	id: 'select-icon',
	name: '$t:interfaces.select-icon.icon',
	description: '$t:interfaces.select-icon.description',
	icon: 'insert_emoticon',
	component: InterfaceSelectIcon,
	types: ['string'],
	options: [],
	recommendedDisplays: ['icon'],
});
