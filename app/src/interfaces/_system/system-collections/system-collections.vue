<script setup lang="ts">
import { useCollectionsStore } from '@/stores/collections';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHideUnusedCollsInWebhooks } from '@/composables/use-hide-unused-items';

const props = withDefaults(
	defineProps<{
		value: string[] | null;
		collection: string;
		disabled?: boolean;
		includeSystem?: boolean;
		includeSingleton?: boolean;
		isUnusedCollsHidden?: boolean | null;
		searchCollections?: string | null
	}>(),
	{ includeSingleton: true },
);

defineEmits<{
	(e: 'input', value: string[] | null): void;
}>();

const { t } = useI18n();

const collectionsStore = useCollectionsStore();

const collections = computed(() => {
	let collections = collectionsStore.collections.filter((collection) => collection.type === 'table');

	if (!props.includeSingleton) {
		collections = collections.filter((collection) => collection?.meta?.singleton === false);
	}

	if (!props.includeSystem) {
		collections = collections.filter((collection) => !collection.collection.startsWith('directus_'));
	}

	return collections;
});

const items = computed(() => {
	if (props.searchCollections) {
		return searchCollectionsFunc()
	}

	return mapPairsForColl(isHideCollsAllowed.value ? usedCollections.value : collections.value)
});

function mapPairsForColl(colls: typeof collections.value) {
	return colls.map((coll) => ({
		text: coll.name,
		value: coll.collection,
	}))
}

// THE LOGIC TO HIDE UNUSED COLLS IN DIRECTUS_WEBHOOKS (only)
// path: directus\app\src\modules\settings\routes\webhooks\item.vue =>
// v-form => form-field => form-field-interface.vue => this file

const { usedCollections, collectionsRef, isHideCollsAllowed, searchCollectionsFunc } = useHideUnusedCollsInWebhooks(
	collections,
	toRef(() => props.value),
	toRef(() => props.collection),
	mapPairsForColl,
	toRef(() => props.isUnusedCollsHidden),
	toRef(() => props.searchCollections),
)
</script>

<template>
	<div ref="collectionsRef">
		<v-notice v-if="items.length === 0">
			{{ t('no_collections') }}
		</v-notice>
		<interface-select-multiple-checkbox v-else :choices="items" :value="value" :collection="collection"
			:search-collections="searchCollections" :disabled="disabled" @input="$emit('input', $event)" />
	</div>
</template>
