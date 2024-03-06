<!-- The component that shows the info about item count in collections
	but styled(the item count in coloed and underlined)
	and there is ability to copy to clipboard the item count number-->

<script setup lang="ts">
import { useClipboard } from '@/composables/use-clipboard';
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
	itemCount: number; // total items in a coll(might be filtered)
	showingCount?: string;
}>();

const { t } = useI18n()

const { showingCount, itemCount } = toRefs(props)

const { copyToClipboard } = useClipboard();

const itemCountComponent = computed(() => {
	return {
		template: generateItemCountTemplate(),
		data: () => ({ totalItemsCount: itemCount.value }),
		methods: { copyToClipboard },
	};
})

function generateItemCountTemplate() {
	// just for any case make sure to always replace the last number thats compatible with itemCount.value
	const itemCountLastInd = showingCount.value?.lastIndexOf(String(itemCount.value)) ?? -1
	const templatePrefix = showingCount.value?.slice(0, itemCountLastInd) ?? '';
	const templateSuffix = showingCount.value?.slice(itemCountLastInd + String(itemCount.value).length) ?? '';

	return showingCount.value && itemCountLastInd !== -1
		? templatePrefix
		+ `<span
					class="total-count"
					v-tooltip.bottom="'${t('Copy To Clipboard')}'"
					@click="() => copyToClipboard(totalItemsCount)"
				>
					{{ totalItemsCount }}
				</span>`
		+ templateSuffix
		: (showingCount.value ?? '');
}
</script>

<template>
	<div class="coll-items-info">
		<component :is="itemCountComponent" />
	</div>
</template>

<style lang="scss" scoped>
.coll-items-info :deep(.total-count) {
	color: var(--theme--primary);
	text-decoration: underline;
	cursor: pointer;

	&:hover {
		color: var(--v-button-background-color-hover, var(--theme--primary-accent));
	}
}
</style>
