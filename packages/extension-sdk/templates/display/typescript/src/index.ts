import { defineDisplay } from '@directus/extension-sdk';
import DisplayComponent from './display.vue';

export default defineDisplay({
	id: 'custom',
	name: 'Custom',
	description: 'This is my custom display!',
	icon: 'box',
	handler: DisplayComponent,
	types: ['string'],
});
