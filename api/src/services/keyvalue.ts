import type { Messenger } from '../messenger.js';
import { getMessenger } from '../messenger.js';
import type { AbstractServiceOptions, Item, MutationOptions, PrimaryKey } from '../types/index.js';
import { ItemsService } from './items.js';

type KeyValue = any

export class KeyValueService extends ItemsService<KeyValue> {
	messenger: Messenger;

	constructor(options: AbstractServiceOptions) {
		super('directus_keyvalue', options);
		this.messenger = getMessenger();
	}

	override async createOne(data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey> {
		const result = await super.createOne(data, opts);
		this.messenger.publish('keyvalue', { type: 'reload' });
		return result;
	}

	override async createMany(data: Partial<Item>[], opts?: MutationOptions): Promise<PrimaryKey[]> {
		const result = await super.createMany(data, opts);
		this.messenger.publish('keyvalue', { type: 'reload' });
		return result;
	}

	override async updateMany(keys: PrimaryKey[], data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey[]> {
		const result = await super.updateMany(keys, data, opts);
		this.messenger.publish('keyvalue', { type: 'reload' });
		return result;
	}

	override async deleteMany(keys: PrimaryKey[], opts?: MutationOptions): Promise<PrimaryKey[]> {
		const result = await super.deleteMany(keys, opts);
		this.messenger.publish('keyvalue', { type: 'reload' });
		return result;
	}
}
