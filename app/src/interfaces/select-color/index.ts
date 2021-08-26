import { defineInterface } from '@directus/shared/utils';
import InterfaceColor from './select-color.vue';

export default defineInterface({
	id: 'select-color',
	name: '$t:interfaces.select-color.color',
	description: '$t:interfaces.select-color.description',
	icon: 'palette',
	component: InterfaceColor,
	types: ['string'],
	recommendedDisplays: ['color'],
	options: [
		{
			field: 'presets',
			name: '$t:interfaces.select-color.preset_colors',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'list',
				options: {
					addLabel: '$t:interfaces.select-color.preset_colors_add_label',
					template: '{{ name }} - {{ color }}',
					fields: [
						{
							field: 'name',
							type: 'string',
							name: '$t:name',
							meta: {
								interface: 'input',
								width: 'half',
								options: {
									placeholder: '$t:interfaces.select-color.name_placeholder',
								},
							},
						},
						{
							field: 'color',
							type: 'string',
							name: '$t:color',
							meta: {
								interface: 'select-color',
								width: 'half',
							},
						},
					],
				},
			},
		},
	],
});
