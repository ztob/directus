# Use Sync

```ts
function useSync<T, K extends keyof T>(
	props: T,
	key: K,

	emit: (event: string, ...args: any[]) => void
): Ref<Readonly<T[K]>>;
```

Small utility composition that allows you to easily setup the two-way binding with the prop:

```ts
// Before

const internalOptions = computed({
	get() {
		return props.options;
	},
	set(val) {
		emit('update:options', val);
	},
});
```

```ts
// after

const internalOptions = useSync(props, 'options', emit);
```
