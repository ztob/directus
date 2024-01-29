import { Role } from '@directus/types';

type RoleBaseFields = 'id' | 'name' | 'description' | 'icon';

export type RoleResponse = Pick<Role, RoleBaseFields | 'admin_access'> & {
	users: [{ count: { id: number } }];
};

export type RoleItem = Pick<Role, RoleBaseFields> &
	Partial<Pick<Role, 'admin_access'>> & {
		public?: boolean;
		count?: number;
	};
