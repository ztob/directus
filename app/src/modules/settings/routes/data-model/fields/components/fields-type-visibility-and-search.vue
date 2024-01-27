<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const props = defineProps<{
	search: string | null
	isShowFieldsType: boolean | null
}>();

const emit = defineEmits(['update:search', 'toggle-fields-type-visibility']);

const { t } = useI18n();

const searchVal = computed({
	get() {
		return props.search
	},
	set(val) {
		emit('update:search', val)
	}
})
</script>

<template>
	<!-- search for fields -->
	<v-input
		v-model="searchVal"
		class="search-fields"
		type="search"
		:placeholder="t('search_field')"
		:full-width="false">
		<template #prepend>
			<v-icon name="search" outline />
		</template>
		<template #append>
			<v-icon v-if="search" clickable class="clear-fields" name="close" @click.stop="searchVal = null" />
		</template>
	</v-input>

	<!-- toggle fields type visibility -->
	<v-button
		v-tooltip.bottom="t('Toggle Fields Type Visibility')"
		rounded
		icon
		:loading="isShowFieldsType === null"
		:disabled="isShowFieldsType === null"
		@click="$emit('toggle-fields-type-visibility', !isShowFieldsType)">
			<v-icon :name="isShowFieldsType ? 'visibility' : 'visibility_off'" />
	</v-button>
</template>

<style lang="scss" scoped>
.v-input.search-fields {
	--v-input-border-radius: calc(44px / 2);
	height: 44px;
	width: 200px;
	margin-left: auto;

	@media (min-width: 600px) {
		width: 300px;
		margin-top: 0px;
	}
}
</style>
