import { defineInterface } from '@directus/shared/utils';
import InterfacePresentationDivider from './presentation-divider.vue';

export default defineInterface({
	id: 'presentation-divider',
	name: '$t:interfaces.presentation-divider.divider',
	description: '$t:interfaces.presentation-divider.description',
	icon: 'remove',
	component: InterfacePresentationDivider,
	hideLabel: true,
	hideLoader: true,
	types: ['alias'],
	groups: ['presentation'],
	options: [
		{
			field: 'color',
			name: '$t:color',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-color',
			},
		},
		{
			field: 'icon',
			name: '$t:icon',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-icon',
			},
		},
		{
			field: 'title',
			name: '$t:title',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: '$t:interfaces.presentation-divider.title_placeholder',
				},
			},
		},
		{
			field: 'marginTop',
			name: '$t:interfaces.presentation-divider.margin_top',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: '$t:interfaces.presentation-divider.margin_top_label',
				},
			},
			schema: {
				default_value: false,
			},
		},
		{
			field: 'inlineTitle',
			name: '$t:interfaces.presentation-divider.inline_title',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: '$t:interfaces.presentation-divider.inline_title_label',
				},
			},
			schema: {
				default_value: false,
			},
		},
	],
});
