import { beforeEach, describe, expect, test, vi } from 'vitest';
import { doMockEnv } from './__utils__/mock-env.js';
import { MessengerMemory, MessengerRedis } from './messenger.js';

vi.mock('ioredis');

const { setEnv } = doMockEnv();

beforeEach(() => {
	vi.resetModules();
});

describe('MessengerMemory', () => {
	test('getMessenger', async () => {
		setEnv({ MESSENGER_STORE: 'memory' });
		const { MessengerMemory, getMessenger } = await import('./messenger.js');

		const messenger = getMessenger();

		expect(messenger).toBeInstanceOf(MessengerMemory);
	});

	test('subscribing', () => {
		const messages: Record<string, string>[] = [];
		const testMessage = { test: 'test' };
		const messenger = new MessengerMemory();

		messenger.subscribe('test', (data: Record<string, string>) => {
			messages.push(data);
		});

		messenger.publish('test', testMessage);

		expect(messenger.handlers['test']?.size ?? 0).toBe(1);
		expect(messages.length).toBe(1);
		expect(messages).toStrictEqual([testMessage]);

		messenger.unsubscribe('test');

		messenger.publish('test', testMessage);

		expect(messenger.handlers['test']?.size ?? 0).toBe(0);
		expect(messages.length).toBe(1);
		expect(messages).toStrictEqual([testMessage]);
	});
});

describe('MessengerRedis', () => {
	test('getMessenger', async () => {
		setEnv({ MESSENGER_STORE: 'redis' });
		const { MessengerRedis, getMessenger } = await import('./messenger.js');

		const messenger = getMessenger();

		expect(messenger).toBeInstanceOf(MessengerRedis);
	});

	test('subscribing', () => {
		const testMessage = { test: 'test' };
		const messenger = new MessengerRedis();

		messenger.subscribe('test', (_data: Record<string, string>) => {
			// do nothing
		});

		expect(messenger.sub.subscribe).toBeCalled();
		expect(messenger.sub.on).toBeCalled();

		messenger.publish('test', testMessage);
		expect(messenger.pub.publish).toBeCalled();

		messenger.unsubscribe('test');
		expect(messenger.sub.unsubscribe).toBeCalled();
	});
});
