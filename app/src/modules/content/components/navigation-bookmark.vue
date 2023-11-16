<script setup lang="ts">
import { usePresetsStore } from '@/stores/presets';
import { useUserStore } from '@/stores/user';
import { getCollectionRoute } from '@/utils/get-route';
import { translate } from '@/utils/translate-literal';
import { unexpectedError } from '@/utils/unexpected-error';
import { Preset } from '@directus/types';
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import { CollectionsItems } from './types';

interface Props {
	bookmark: Preset;
	collectionsItems: CollectionsItems;
}

const props = defineProps<Props>();

const emit = defineEmits(['update-items-collection']);

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const { currentUser, isAdmin } = useUserStore();
const presetsStore = usePresetsStore();

const isMine = computed(() => props.bookmark.user === currentUser!.id);

const hasPermission = computed(() => isMine.value || isAdmin);

const scope = computed(() => {
	if (props.bookmark.user && !props.bookmark.role) return 'personal';
	if (!props.bookmark.user && props.bookmark.role) return 'role';
	return 'global';
});

const { editActive, editValue, editSave, editSaving, editCancel } = useEditBookmark();
const { deleteActive, deleteSave, deleteSaving } = useDeleteBookmark();

const name = computed(() => translate(props.bookmark.bookmark));

function useEditBookmark() {
	const editActive = ref(false);

	const editValue = reactive({
		name: props.bookmark.bookmark,
		icon: props.bookmark?.icon ?? 'bookmark',
		color: props.bookmark?.color ?? null,
	});

	const editSaving = ref(false);

	return { editActive, editValue, editSave, editSaving, editCancel };

	async function editSave() {
		editSaving.value = true;

		try {
			await presetsStore.savePreset({
				...props.bookmark,
				bookmark: editValue.name,
				icon: editValue.icon,
				color: editValue.color,
			});

			editActive.value = false;
		} catch (error) {
			unexpectedError(error);
		} finally {
			editSaving.value = false;
		}
	}

	function editCancel() {
		editActive.value = false;
		editValue.name = props.bookmark.bookmark;
		editValue.icon = props.bookmark?.icon ?? 'bookmark';
		editValue.color = props.bookmark?.color ?? null;
	}
}

function useDeleteBookmark() {
	const deleteActive = ref(false);
	const deleteSaving = ref(false);

	return { deleteActive, deleteSave, deleteSaving };

	async function deleteSave() {
		deleteSaving.value = true;

		try {
			let navigateTo: string | null = null;

			if (route.query?.bookmark && +route.query.bookmark === props.bookmark.id) {
				navigateTo = getCollectionRoute(props.bookmark.collection);
			}

			await presetsStore.delete([props.bookmark.id!]);
			deleteActive.value = false;

			if (navigateTo) {
				router.replace(navigateTo);
			}
		} catch (error) {
			unexpectedError(error);
		} finally {
			deleteSaving.value = false;
		}
	}
}

// Changed
const itemsCount = ref('');
const isCountLoading = ref(false)

let refreshIntervalId = null;

watch(() => props.bookmark, () => {
	const isShowNumber = props.bookmark?.layout_options?.show_items_number

	if (!isShowNumber) return itemsCount.value = ''

	if (refreshIntervalId) {
		clearInterval(refreshIntervalId);
	}

	if (props.bookmark.refresh_interval) {
		refreshIntervalId = setInterval(() => {
			fetchPresetItems()
		}, props.bookmark.refresh_interval * 1000)
	}

	fetchPresetItems()

}, { deep: true, immediate: true })

async function fetchPresetItems() {
	try {
		isCountLoading.value = true

		const params = {
			filter: null,
			search: null,
			aggregate: {
				count: '*',
			},
		};

		params.filter = props.bookmark.filter

		params.search = props.bookmark.search

		const { data } = await api.get(`items/${props.bookmark.collection}`, {
			params
		})

		itemsCount.value = formatNumberWithCommas(Number(data.data[0].count))
	} catch (err) {
		console.log(err);
	} finally {
		isCountLoading.value = false
	}
}

function formatNumberWithCommas(number: number) {
	if (number >= 10000) return number.toLocaleString("en-US");
	return number.toString();
}

// show percentage on hover
const isHovering = ref(false)
const percentage = ref('')

async function getPercentage() {
	const isShowPercentage = props.bookmark?.layout_options?.show_items_number

	if (!isShowPercentage) {
		percentage.value = '';
		return;
	}

	isHovering.value = true;
	const collection = props.bookmark.collection;

	if (!(collection in props.collectionsItems)) {
		const hoverDelay = 400
		let timeout = null;

		timeout = setTimeout(() => {
			if (!isHovering.value) {
				timeout = null;
				return
			}

			fetchTotalItemsCount()
				.then((itemsInCollection) => {
					percentage.value = countPercentage(itemsCount.value, +itemsInCollection)
					emit('update-items-collection', collection, +itemsInCollection)
				})
				.finally(() => timeout = null)
		}, hoverDelay)

	} else {
		// If the collection already exists in props.collectionsItems, calculate the percentage immediately
		percentage.value = countPercentage(itemsCount.value, props.collectionsItems[collection]!)
	}

	async function fetchTotalItemsCount() {
		try {
			const { data } = await api.get(`items/${collection}`, {
				params: {
					aggregate: {
						count: '*',
					},
				},
			});

			return data?.data?.[0]?.count ?? 0;
		} catch (error) {
			console.log(error);
		}
	}

	function countPercentage(presetItems: string /* '1,234,567' */, totalItems: number) {
		if (totalItems === 0) return (0).toFixed(1)

		// '1,234,567' => '1234567'
		const presetItemsCount = presetItems.split('').filter(char => char !== ',').join('')
		return (+presetItemsCount / totalItems * 100).toFixed(1);
	}
}
</script>

<template>
	<v-list-item :to="`${getCollectionRoute(bookmark.collection)}?bookmark=${bookmark.id}`" query class="bookmark" clickable
		@contextmenu.stop="">
		<v-list-item-icon><v-icon :name="bookmark.icon" :color="bookmark.color" /></v-list-item-icon>

		<v-list-item-content>
			<v-text-overflow :text="`${name} ${isCountLoading ? '(...)' : !itemsCount ? '' : `(${itemsCount})`}`"
				@mouseover="getPercentage" @mouseleave="isHovering = false" />
		</v-list-item-content>

		<span :class="{ 'percentage-tooltip': true, 'active': isHovering }">{{
			percentage ? `${percentage}%` : ''
		}}</span>

		<v-menu placement="bottom-start" show-arrow>
			<template #activator="{ toggle }">
				<v-icon v-tooltip.bottom="!hasPermission && t(`cannot_edit_${scope}_bookmarks`)"
					:name="hasPermission ? 'more_vert' : 'lock'" :clickable="hasPermission" small class="ctx-toggle"
					@click.prevent="hasPermission ? toggle() : null" />
			</template>
			<v-list>
				<v-list-item clickable :to="scope !== 'personal' ? `/settings/presets/${bookmark.id}` : undefined"
					@click="scope === 'personal' ? (editActive = true) : undefined">
					<v-list-item-icon>
						<v-icon name="edit" outline />
					</v-list-item-icon>
					<v-list-item-content>
						<v-text-overflow :text="t(`edit_${scope}_bookmark`)" />
					</v-list-item-content>
				</v-list-item>
				<v-list-item clickable class="danger" @click="deleteActive = true">
					<v-list-item-icon>
						<v-icon name="delete" outline />
					</v-list-item-icon>
					<v-list-item-content>
						<v-text-overflow :text="t(`delete_${scope}_bookmark`)" />
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-menu>

		<v-dialog v-model="editActive" persistent @esc="editCancel">
			<v-card>
				<v-card-title>{{ t('edit_personal_bookmark') }}</v-card-title>
				<v-card-text>
					<div class="fields">
						<interface-system-input-translated-string :value="editValue.name" class="full" autofocus
							@input="editValue.name = $event" @keyup.enter="editSave" />
						<interface-select-icon width="half" :value="editValue.icon" @input="editValue.icon = $event" />
						<interface-select-color width="half" :value="editValue.color" @input="editValue.color = $event" />
					</div>
				</v-card-text>
				<v-card-actions>
					<v-button secondary @click="editCancel">{{ t('cancel') }}</v-button>
					<v-button :disabled="editValue.name === null" :loading="editSaving" @click="editSave">
						{{ t('save') }}
					</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="deleteActive" persistent @esc="deleteActive = false">
			<v-card>
				<v-card-title>{{ t('delete_bookmark_copy', { bookmark: bookmark.bookmark }) }}</v-card-title>
				<v-card-actions>
					<v-button secondary @click="deleteActive = false">{{ t('cancel') }}</v-button>
					<v-button :loading="deleteSaving" kind="danger" @click="deleteSave">
						{{ t('delete_label') }}
					</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-list-item>
</template>

<style lang="scss" scoped>
.danger {
	--v-list-item-color: var(--theme--danger);
	--v-list-item-icon-color: var(--theme--danger);
}

.v-list-item {
	.ctx-toggle {
		--v-icon-color: var(--theme--foreground-subdued);

		opacity: 0;
		user-select: none;
		transition: opacity var(--fast) var(--transition);
	}

	&:hover {
		.ctx-toggle {
			opacity: 1;
			user-select: auto;
		}
	}
}

.fields {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;

	.full {
		grid-column: 1 / span 2;
	}
}

// CHANGED
.percentage-tooltip {
	display: none;

	&.active {
		display: inline-block;
		// position: absolute;
		// right: 25px;
		// background-color: #f5f5f5;
		// color: black;
		// border-radius: 5px;
		// padding: 3px;
	}
}
</style>
