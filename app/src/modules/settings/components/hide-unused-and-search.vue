<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
	searchVal: string | null;
	isUnusedCollsHidden: boolean | null;
}>()

defineEmits(['update:search-val', 'hide-unused-toggle'])
</script>

<template>
	<v-input :model-value="searchVal" class="search" type="search" :placeholder="t('search_collection')" :full-width="false"
		@update:model-value="$emit('update:search-val', $event)">
		<template #prepend>
			<v-icon name="search" outline />
		</template>
		<template #append>
			<v-icon v-if="searchVal" clickable class="clear" name="close" @click.stop="$emit('update:search-val', null)" />
		</template>
	</v-input>

	<v-button v-if="isUnusedCollsHidden !== null" v-tooltip.bottom="t('Hide Unused Collections')" rounded icon secondary
		:kind="!isUnusedCollsHidden ? 'normal' : 'success'" :loading="isUnusedCollsHidden === null"
		@click="$emit('hide-unused-toggle', $event)">
		<v-icon name="visibility_off" />
	</v-button>
</template>

<style scoped>
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
