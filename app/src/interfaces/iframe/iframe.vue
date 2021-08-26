<template>
	<div>
		<iframe :width="widthAttribute" :height="heightAttribute" :src="urlAttribute"></iframe>
	</div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, PropType } from 'vue';
import { Field } from '@directus/shared/types';
export default defineComponent({
	props: {
		value: {
			type: Array as PropType<Record<string, any>[]>,
			default: null,
		},
		fields: {
			type: Array as PropType<Partial<Field>[]>,
			default: () => [],
		},
		template: {
			type: String,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		urlAttribute: {
			type: String,
			default: '',
		},
		widthAttribute: {
			type: String,
			default: '',
		},
		heightAttribute: {
			type: String,
			default: '',
		},
		collection: {
			type: String,
			default: null,
		},
	},
	emits: ['input'],
});
</script>
