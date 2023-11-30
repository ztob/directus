<script setup lang="ts">
import { useEditsGuard } from '@/composables/use-edits-guard';
import { useItem } from '@/composables/use-item';
import { useShortcut } from '@/composables/use-shortcut';
import RevisionsDrawerDetail from '@/views/private/components/revisions-drawer-detail.vue';
import SaveOptions from '@/views/private/components/save-options.vue';
import { computed, onMounted, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import SettingsNavigation from '../../components/navigation.vue';
import api from '@/api';

const props = defineProps<{
	primaryKey: string;
}>();

const { t } = useI18n();

const router = useRouter();

const { primaryKey } = toRefs(props);

const revisionsDrawerDetailRef = ref<InstanceType<typeof RevisionsDrawerDetail> | null>(null);

const { isNew, edits, hasEdits, item, saving, loading, save, remove, deleting, saveAsCopy, validationErrors } = useItem(
	ref('directus_webhooks'),
	primaryKey,
);

const confirmDelete = ref(false);

const title = computed(() => {
	if (loading.value) return t('loading');
	if (isNew.value) return t('creating_webhook');
	return item.value?.name;
});

useShortcut('meta+s', () => {
	if (hasEdits.value) saveAndStay();
});

useShortcut('meta+shift+s', () => {
	if (hasEdits.value) saveAndAddNew();
});

const { confirmLeave, leaveTo } = useEditsGuard(hasEdits);

async function saveAndQuit() {
	await save();
	router.push(`/settings/webhooks`);
}

async function saveAndStay() {
	await save();
	revisionsDrawerDetailRef.value?.refresh?.();
}

async function saveAndAddNew() {
	await save();
	router.push(`/settings/webhooks/+`);
}

async function saveAsCopyAndNavigate() {
	const newPrimaryKey = await saveAsCopy();
	if (newPrimaryKey) router.push(`/settings/webhooks/${newPrimaryKey}`);
}

async function deleteAndQuit() {
	await remove();
	edits.value = {};
	router.replace(`/settings/webhooks`);
}

function discardAndLeave() {
	if (!leaveTo.value) return;
	edits.value = {};
	confirmLeave.value = false;
	router.push(leaveTo.value);
}

function discardAndStay() {
	edits.value = {};
	confirmLeave.value = false;
}

// LOGIC FOR HIDING UNUSED COLLECTIONS (all that are unchecked)
const isUnusedCollsHidden = ref<boolean | null>(null)
const searchCollections = ref<string | null>(null)

// set isUnusedCollsHidden when the webhook loads
onMounted(async () => {
	try {
		// if webhook is being created then there is no abillity to hide unused colls
		if(primaryKey.value === '+') {
			return
		}

		const { data } = await api.get(`webhooks/${primaryKey.value}`)
		isUnusedCollsHidden.value = data.data.hide_unused_colls
	} catch (error) {
		console.log(error);
	}
})

async function hideUnusedCollsToggle() {
	isUnusedCollsHidden.value = !isUnusedCollsHidden.value

	try {
		const { data } = await api.patch(`webhooks/${primaryKey.value}`, {
			hide_unused_colls: isUnusedCollsHidden.value
		})

		// set isUnusedCollsHidden to make sure the value is the same as it is in DB
		isUnusedCollsHidden.value = data.data.hide_unused_colls
	} catch (error) {
		console.log(error);
	}
}
</script>

<template>
	<private-view :title="title">
		<template #headline>
			<v-breadcrumb :items="[{ name: t('settings_webhooks'), to: '/settings/webhooks' }]" />
		</template>

		<template #title-outer:prepend>
			<v-button class="header-icon" rounded icon exact :to="`/settings/webhooks/`">
				<v-icon name="arrow_back" />
			</v-button>
		</template>

		<template #actions>
			<!-- LOGIC TO HIDE UNUSED COLLS -->
			<v-input
				v-model="searchCollections"
				class="search"
				type="search"
				:placeholder="t('search_collection')"
				:full-width="false"
				:disabled="isUnusedCollsHidden === null"
			>
				<template #prepend>
					<v-icon name="search" outline />
				</template>
				<template #append>
					<v-icon v-if="searchCollections" clickable class="clear" name="close" @click.stop="searchCollections = null" />
				</template>
			</v-input>

			<v-button
				v-if="primaryKey !== '+'"
				v-tooltip.bottom="t('Hide Unused Collections')"
				rounded
				icon
				secondary
				:kind="!isUnusedCollsHidden ? 'normal' : 'success'"
				:loading="isUnusedCollsHidden === null"
				@click="hideUnusedCollsToggle">
				<v-icon name="visibility_off" />
			</v-button>

			<v-dialog v-model="confirmDelete" @esc="confirmDelete = false">
				<template #activator="{ on }">
					<v-button rounded icon class="action-delete" :disabled="item === null" @click="on">
						<v-icon name="delete" />
					</v-button>
				</template>

				<v-card>
					<v-card-title>{{ t('delete_are_you_sure') }}</v-card-title>

					<v-card-actions>
						<v-button secondary @click="confirmDelete = false">
							{{ t('cancel') }}
						</v-button>
						<v-button kind="danger" :loading="deleting" @click="deleteAndQuit">
							{{ t('delete_label') }}
						</v-button>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-button rounded icon :loading="saving" :disabled="hasEdits === false" @click="saveAndQuit">
				<v-icon name="check" />

				<template #append-outer>
					<save-options
						v-if="hasEdits === true"
						@save-and-stay="saveAndStay"
						@save-and-add-new="saveAndAddNew"
						@save-as-copy="saveAsCopyAndNavigate"
						@discard-and-stay="discardAndStay"
					/>
				</template>
			</v-button>
		</template>

		<template #navigation>
			<settings-navigation />
		</template>

		<v-form
			v-model="edits"
			:loading="loading"
			:initial-values="item"
			collection="directus_webhooks"
			:primary-key="primaryKey"
			:validation-errors="validationErrors"
			:is-unused-colls-hidden="isUnusedCollsHidden"
			:search-collections="searchCollections"
		/>

		<template #sidebar>
			<sidebar-detail icon="info" :title="t('information')" close>
				<div v-md="t('page_help_settings_webhooks_item')" class="page-description" />
			</sidebar-detail>
			<revisions-drawer-detail
				v-if="isNew === false"
				ref="revisionsDrawerDetailRef"
				collection="directus_webhooks"
				:primary-key="primaryKey"
			/>
		</template>

		<v-dialog v-model="confirmLeave" @esc="confirmLeave = false">
			<v-card>
				<v-card-title>{{ t('unsaved_changes') }}</v-card-title>
				<v-card-text>{{ t('unsaved_changes_copy') }}</v-card-text>
				<v-card-actions>
					<v-button secondary @click="discardAndLeave">
						{{ t('discard_changes') }}
					</v-button>
					<v-button @click="confirmLeave = false">{{ t('keep_editing') }}</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</private-view>
</template>

<style lang="scss" scoped>
.action-delete {
	--v-button-background-color: var(--danger-10);
	--v-button-color: var(--theme--danger);
	--v-button-background-color-hover: var(--danger-25);
	--v-button-color-hover: var(--theme--danger);
}

.v-form {
	padding: var(--content-padding);
	padding-bottom: var(--content-padding-bottom);
}

.header-icon {
	--v-button-background-color: var(--theme--primary-background);
	--v-button-color: var(--theme--primary);
	--v-button-background-color-hover: var(--theme--primary-subdued);
	--v-button-color-hover: var(--theme--primary);
}
.v-input.search {
	height: var(--v-button-height);
	--border-radius: calc(44px / 2);
	width: 200px;
	margin-left: auto;

	@media (min-width: 600px) {
		width: 300px;
		margin-top: 0px;
	}
}
</style>
