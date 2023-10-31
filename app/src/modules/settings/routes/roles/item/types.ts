export type ModuleBarItem = {
	id: string;
	name: string;
	type: 'module' | 'link';
	enabled: boolean;
	url?: string;
	icon?: string;
	children?: ModuleBarItem[];
	disallowed_roles?: string[];
};

export type PreviewExtra = {
	to: string;
	name: string;
	icon: string;
};
