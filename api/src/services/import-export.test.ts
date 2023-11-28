import { describe, expect, it } from 'vitest';

import { ExportService } from './import-export.js';
import { getDateFormatted } from '../utils/get-date-formatted.js';

describe('Import & Export', () => {
	describe('Export Service', () => {
		it('generates title with prefix and suffix', () => {
			const service = new ExportService({
				schema: {
					collections: {},
					relations: [],
				},
			});

			const prefix = 'my prefix';
			const collection = 'my collection';
			const date = getDateFormatted();
			const suffix = 'my suffix';

			const title = service.generateTitle(prefix, collection, suffix);

			expect(title).toEqual(`${prefix}-${collection}-${date}-${suffix}`);
		});
	});
});
