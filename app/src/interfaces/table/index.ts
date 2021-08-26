import { defineInterface } from '@directus/shared/utils';
import TableOptions from './options.vue';
import InterfaceTable from './table.vue';

export default defineInterface({
	id: 'table',
	name: '$t:interfaces.table.table',
	description: '$t:interfaces.table.description',
	icon: 'table_chart',
	component: InterfaceTable,
	types: ['json'],
	options: TableOptions,
});
