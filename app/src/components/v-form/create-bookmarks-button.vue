<script setup lang="ts">

interface Props {
	isDisabled: boolean;
}

defineProps<Props>();

</script>

<template>
	<v-button class="create-bookmarks-btn" :disabled="isDisabled">
		Create Bookmarks
	</v-button>
</template>

<style lang="scss" scoped>
.create-bookmarks-btn {
	padding-top: 10px;
}
</style>
