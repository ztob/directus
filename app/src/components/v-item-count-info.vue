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

const itemCountLastInd = computed(() =>
	showingCount.value?.lastIndexOf(String(itemCount.value)) ?? -1
)

const prefix = computed(() =>
	itemCountLastInd.value !== -1 ? showingCount.value!.slice(0, itemCountLastInd.value) : ''
)

const suffix = computed(() =>
	itemCountLastInd.value !== -1 ? showingCount.value!.slice(itemCountLastInd.value + String(itemCount.value).length) : ''
)
</script>

<template>
	<div>
		<div v-if="!prefix && !suffix">{{ showingCount }}</div>
		<div v-else>
			<span>{{ prefix }}</span>
			<span v-tooltip.bottom="t('Copy To Clipboard')" class="total-items-count" @click="copyToClipboard(itemCount)">
				{{ itemCount }}
			</span>
			<span>{{ suffix }}</span>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.total-items-count {
	color: var(--theme--primary);
	text-decoration: underline;
	cursor: pointer;

	&:hover {
		color: var(--v-button-background-color-hover, var(--theme--primary-accent));
	}
}
</style>
