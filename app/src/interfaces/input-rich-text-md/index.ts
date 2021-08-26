import { defineInterface } from '@directus/shared/utils';
import InterfaceInputRichTextMD from './input-rich-text-md.vue';

export default defineInterface({
	id: 'input-rich-text-md',
	name: '$t:interfaces.input-rich-text-md.markdown',
	description: '$t:interfaces.input-rich-text-md.description',
	icon: 'functions',
	component: InterfaceInputRichTextMD,
	types: ['text'],
	options: [
		{
			field: 'placeholder',
			name: '$t:placeholder',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input-multiline',
				options: {
					placeholder: '$t:enter_a_placeholder',
				},
			},
		},
		{
			field: 'customSyntax',
			name: '$t:interfaces.input-rich-text-md.customSyntax',
			type: 'json',
			meta: {
				note: '$t:interfaces.input-rich-text-md.customSyntax_label',
				width: 'full',
				interface: 'list',
				options: {
					addLabel: '$t:interfaces.input-rich-text-md.customSyntax_add',
					template: '{{ name }}',
					fields: [
						{
							field: 'name',
							type: 'string',
							name: '$t:name',
							meta: {
								interface: 'input',
								width: 'half',
							},
						},
						{
							field: 'icon',
							type: 'string',
							name: '$t:icon',
							meta: {
								interface: 'select-icon',
								width: 'half',
							},
						},
						{
							field: 'prefix',
							type: 'string',
							name: '$t:prefix',
							meta: {
								interface: 'input',
								width: 'half',
							},
						},
						{
							field: 'suffix',
							type: 'string',
							name: '$t:suffix',
							meta: {
								interface: 'input',
								width: 'half',
							},
						},
						{
							field: 'box',
							type: 'string',
							name: '$t:interfaces.input-rich-text-md.box',
							meta: {
								interface: 'select-radio',
								width: 'half',
								options: {
									choices: [
										{
											text: '$t:inline',
											value: 'inline',
										},
										{
											text: '$t:block',
											value: 'block',
										},
									],
								},
							},
							schema: {
								default_value: 'inline',
							},
						},
					],
				},
			},
		},
		{
			field: 'imageToken',
			name: '$t:interfaces.input-rich-text-md.imageToken',
			type: 'string',
			meta: {
				note: '$t:interfaces.input-rich-text-md.imageToken_label',
				width: 'full',
				interface: 'input',
			},
		},
	],
});
