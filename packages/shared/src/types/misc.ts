/* eslint-disable @typescript-eslint/ban-types */

type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type Builtin = Primitive | Function | Date | Error | RegExp;
type IsTuple<T> = T extends readonly [unknown]
	? T
	: T extends readonly [unknown, unknown]
	? T
	: T extends readonly [unknown, unknown, unknown]
	? T
	: T extends readonly [unknown, unknown, unknown, unknown]
	? T
	: T extends readonly [unknown, unknown, unknown, unknown, unknown]
	? T
	: never;

export type DeepPartial<T> = T extends Primitive | Builtin
	? T
	: T extends Map<infer K, infer V>
	? Map<DeepPartial<K>, DeepPartial<V>>
	: T extends ReadonlyMap<infer K, infer V>
	? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
	: T extends WeakMap<infer K, infer V>
	? WeakMap<DeepPartial<K>, DeepPartial<V>>
	: T extends Set<infer U>
	? Set<DeepPartial<U>>
	: T extends ReadonlySet<infer U>
	? ReadonlySet<DeepPartial<U>>
	: T extends WeakSet<infer U>
	? WeakSet<DeepPartial<U>>
	: T extends Array<infer U>
	? T extends IsTuple<T>
		? { [K in keyof T]?: DeepPartial<T[K]> }
		: Array<DeepPartial<U>>
	: T extends Promise<infer U>
	? Promise<DeepPartial<U>>
	: T extends {}
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: Partial<T>;

export type Plural<T extends string> = `${T}s`;
