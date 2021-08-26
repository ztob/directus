declare module '*.vue' {
	import { DefineComponent } from 'vue';
	// eslint-disable-next-line @typescript-eslint/ban-types
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module '*.md' {
	const value: string;
	export default value;
}

declare module '*.yaml' {
	const value: Record<string, any>;
	export default value;
}

declare module '*.json' {
	const value: { [key: string]: any };
	export default value;
}

declare module 'jsonlint-mod' {
	const x: any;
	export default x;
}

declare module '@directus-extensions-interface' {
	import { InterfaceConfig } from '@directus/shared/types';
	const interfaces: InterfaceConfig[];
	export default interfaces;
}

declare module '@directus-extensions-display' {
	import { DisplayConfig } from '@directus/shared/types';
	const displays: DisplayConfig[];
	export default displays;
}

declare module '@directus-extensions-layout' {
	import { LayoutConfig } from '@directus/shared/types';
	const layouts: LayoutConfig[];
	export default layouts;
}

declare module '@directus-extensions-module' {
	import { ModuleConfig } from '@directus/shared/types';
	const modules: ModuleConfig[];
	export default modules;
}
