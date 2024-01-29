import { ref } from 'vue';
import { RoleItem } from '../types/roles';
import { unexpectedError } from '@/utils/unexpected-error';
import api from '@/api';

export function useSelectDeleteRoles(fetchRoles: () => Promise<void>) {
	const selectedRoles = ref<RoleItem[]>([]);
	const confirmDelete = ref(false);
	const deleting = ref(false);

	return { selectedRoles, deleting, confirmDelete, deleteSelectedRoles };

	async function deleteSelectedRoles() {
		try {
			deleting.value = true;

			const rolesToDelete = selectedRoles.value.filter((role) => role.admin_access === false && role.id !== 'public');

			for (const role of rolesToDelete) {
				await api.delete(`/roles/${role.id}`);
			}

			await fetchRoles();
		} catch (err) {
			unexpectedError(err);
		} finally {
			selectedRoles.value = [];
			confirmDelete.value = false;
			deleting.value = false;
		}
	}
}
