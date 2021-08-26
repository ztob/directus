import { Permission } from '@directus/shared/types';

export const appRecommendedPermissions: Partial<Permission>[] = [
	{
		collection: 'directus_files',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus_files',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus_files',
		action: 'update',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus_files',
		action: 'delete',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus_folders',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus_folders',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus_folders',
		action: 'update',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus_folders',
		action: 'delete',
		permissions: {},
	},
	{
		collection: 'directus_users',
		action: 'read',
		permissions: {},
	},
	{
		collection: 'directus_users',
		action: 'update',
		permissions: {
			id: {
				_eq: '$CURRENT_USER',
			},
		},
		fields: [
			'first_name',
			'last_name',
			'email',
			'password',
			'location',
			'title',
			'description',
			'avatar',
			'language',
			'theme',
		],
	},
	{
		collection: 'directus_roles',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
];

export const appMinimalPermissions: Partial<Permission>[] = [
	{
		collection: 'directus_activity',
		action: 'read',
		permissions: {
			user: {
				_eq: '$CURRENT_USER',
			},
		},
	},
	{
		collection: 'directus_activity',
		action: 'create',
		validation: {
			comment: {
				_nnull: true,
			},
		},
	},
	{
		collection: 'directus_collections',
		action: 'read',
	},
	{
		collection: 'directus_fields',
		action: 'read',
	},
	{
		collection: 'directus_permissions',
		action: 'read',
		permissions: {
			role: {
				_eq: '$CURRENT_ROLE',
			},
		},
	},
	{
		collection: 'directus_presets',
		action: 'read',
		permissions: {
			_or: [
				{
					user: {
						_eq: '$CURRENT_USER',
					},
				},
				{
					_and: [
						{
							user: {
								_null: true,
							},
						},
						{
							role: {
								_eq: '$CURRENT_ROLE',
							},
						},
					],
				},
				{
					_and: [
						{
							user: {
								_null: true,
							},
						},
						{
							role: {
								_null: true,
							},
						},
					],
				},
			],
		},
	},
	{
		collection: 'directus_presets',
		action: 'create',
		validation: [
			{
				user: null,
				_eq: '$CURRENT_USER',
			},
		],
	},
	{
		collection: 'directus_presets',
		action: 'update',
		permissions: {
			user: {
				_eq: '$CURRENT_USER',
			},
		},
	},
	{
		collection: 'directus_presets',
		action: 'delete',
		permissions: {
			user: {
				_eq: '$CURRENT_USER',
			},
		},
	},
	{
		collection: 'directus_relations',
		action: 'read',
	},
	{
		collection: 'directus_roles',
		action: 'read',
		permissions: {
			id: {
				_eq: '$CURRENT_ROLE',
			},
		},
	},
	{
		collection: 'directus_settings',
		action: 'read',
	},
	{
		collection: 'directus_users',
		action: 'read',
		permissions: {
			id: {
				_eq: '$CURRENT_USER',
			},
		},
		fields: [
			'id',
			'first_name',
			'last_name',
			'email',
			'password',
			'location',
			'title',
			'description',
			'tags',
			'preferences_divider',
			'avatar',
			'language',
			'theme',
			'tfa_secret',
			'status',
			'role',
		],
	},
];
