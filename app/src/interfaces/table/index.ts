import { defineInterface } from '@directus/shared/utils';
import TableOptions from './options.vue';
import InterfaceTable from './table.vue';

export default defineInterface({
	id: 'table',
	name: 'Table',
	description: 'Render JSON in a table format',
	icon: 'replay',
	component: InterfaceTable,
	types: ['json'],
	options: TableOptions,
});
