import { defineInterface } from '@directus/extensions';
import InterfaceFile from './file.vue';
import PreviewSVG from './preview.svg?raw';

export default defineInterface({
	id: 'file',
	name: '$t:interfaces.file.file',
	description: '$t:interfaces.file.description',
	icon: 'note_add',
	component: InterfaceFile,
	types: ['uuid'],
	localTypes: ['file'],
	group: 'relational',
	relational: true,
	options: [
		{
			field: 'folder',
			name: '$t:interfaces.system-folder.folder',
			type: 'uuid',
			meta: {
				width: 'full',
				interface: 'system-folder',
				note: '$t:interfaces.system-folder.field_hint',
			},
		},
		{
			field: 'allowed_files',
			name: 'Allowed Files',
			meta: {
				interface: 'select-multiple-dropdown',
				options: {
					choices: [
						{
							text: '.docx',
							value: '.docx',
						},
						{
							text: '.txt',
							value: '.txt',
						},
					],
				},
				width: 'half',
				note: 'By default ALL files are allowed',
			},
		},
	],
	recommendedDisplays: ['file'],
	preview: PreviewSVG,
});
