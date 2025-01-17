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
	// @ts-ignore
	options: (options) => {

		const isAllowDocumentsUpload = options.field.meta?.options?.allow_documents ?? false

		return [
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
				field: 'allow_documents',
				name: 'Allow Template',
				meta: {
					interface: 'boolean',
					width: 'full',
				},
				schema: {
					default_value: false,
				},
			},
			...(isAllowDocumentsUpload ?
			[{
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
			{
				field: 'use_storage',
				name: 'Use KeyValue Storage',
				meta: {
					interface: 'boolean',
					width: 'half',
				},
				schema: {
					default_value: false,
				},
			},
			{
				field: 'suffixes',
				name: 'Downloaded File Name Suffixes',
				meta: {
					interface: 'system-display-template',
					options: {
						collectionName: options.collection,
						// add additional custom boolean to be able to add to the treeList options
						// another option: current_date for the File Component
						isFileInterface: true
					},
					width: 'full',
				},
			}]
			:
			[])
		]
	},
	recommendedDisplays: ['file'],
	preview: PreviewSVG,
});
