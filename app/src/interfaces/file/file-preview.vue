<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { FileType } from './types';

defineProps<{
	modelValue: boolean
	fileType: FileType
	file: Record<string, any> | null
	isPdfDownloading: boolean;
}>();

defineEmits(['update:model-value', 'download-docx', 'download-txt', 'download-pdf']);

const { t } = useI18n();
</script>

<template>
	<v-dialog :model-value="modelValue" @esc="$emit('update:model-value', false)"
		@update:model-value="$emit('update:model-value', false)">
		<div class="file-preview">
			<v-card-title>{{ t(`Preview ${file?.title} (${fileType})`) }}</v-card-title>
			<v-card-text>
				<slot/>
			</v-card-text>
			<v-card-actions class="file-preview_bts">
				<v-button
				v-tooltip.top="t('Download As .pdf')"
				:loading="isPdfDownloading"
				@click="$emit('download-pdf')">
				{{ t('Download .pdf') }}
				</v-button>

				<v-button
					v-tooltip.top="t(`Download As ${fileType}`)"
					@click="fileType === '.docx' ? $emit('download-docx') : $emit('download-txt')">
					{{ t(`Download ${fileType}`) }}
				</v-button>

				<v-button secondary @click="$emit('update:model-value', false)">{{ t('Exit') }}</v-button>
			</v-card-actions>
		</div>
	</v-dialog>
</template>

<style lang="scss" scoped>
.file-preview {
	--theme--form--row-gap: 52px;

	min-width: var(--v-card-min-width, none);
	max-width: 90vw;
	height: auto;
	max-height: 90vh;
	overflow: auto;

	/* Page Content Spacing */
	font-size: 15px;
	line-height: 24px;
	background-color: var(--v-card-background-color, var(--theme--form--field--input--background-subdued));
	border-radius: var(--theme--border-radius);
}
</style>
