import { defineInterface } from '@directus/shared/utils';
import CodeMirror from 'codemirror';
import 'codemirror/mode/meta';
import InterfaceCode from './input-code.vue';

const choicesMap = CodeMirror.modeInfo.reduce((acc: Record<string, string>, choice) => {
	if (['JSON', 'JSON-LD'].includes(choice.name)) {
		acc['JSON'] = 'JSON';
		return acc;
	}

	if (choice.mode == null || choice.mode == 'null') {
		choice.mode = 'plaintext';
	}

	if (choice.mode in acc) {
		acc[choice.mode] += ' / ' + choice.name;
	} else {
		acc[choice.mode] = choice.name;
	}

	return acc;
}, {});

const choices = Object.entries(choicesMap).map(([key, value]) => ({
	text: value,
	value: key,
}));

export default defineInterface({
	id: 'input-code',
	name: '$t:interfaces.input-code.code',
	description: '$t:interfaces.input-code.description',
	icon: 'code',
	component: InterfaceCode,
	types: ['string', 'json', 'text'],
	options: [
		{
			field: 'language',
			name: '$t:language',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: { choices },
			},
		},
		{
			field: 'lineNumber',
			name: '$t:interfaces.input-code.line_number',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
			},
			schema: {
				default_value: false,
			},
		},
		{
			field: 'template',
			name: '$t:template',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: {
					placeholder: '$t:interfaces.input-code.placeholder',
				},
			},
			schema: {
				default_value: null,
			},
		},
	],
});
