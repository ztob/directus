<script setup lang="ts">
import { FileType, LoadingFileStatus } from './types';
import { useI18n } from 'vue-i18n';

defineProps<{
	loadingFileStatus: LoadingFileStatus
	fileError: string | null
	fileType: FileType

	// if there are edits in the item, then we dont show the action buttons(render/download template)
	isItemFormEdition: boolean
	isPdfDownloading: boolean
}>();

defineEmits(['open-preview', 'download-docx', 'download-txt', 'download-pdf']);

const { t } = useI18n();
</script>

<template>
	<div>
		<v-skeleton-loader v-if="loadingFileStatus === 'loading'" />

		<div v-if="loadingFileStatus === 'success' && !fileError && fileType && !isItemFormEdition"
			class="preview-btn-actions">
			<v-button v-tooltip.bottom="t('Preview')" icon @click="$emit('open-preview')"><v-icon name="preview" /></v-button>

			<v-button v-tooltip.bottom="t(`Download As ${fileType}`)"
				@click="fileType === '.docx' ? $emit('download-docx') : $emit('download-txt')">
				{{ t(`Download ${fileType}`) }}
			</v-button>

			<v-button
				v-tooltip.bottom="t('Download As .pdf')"
				:loading="isPdfDownloading"
				@click="$emit('download-pdf')">
				{{ t('Download .pdf') }}
			</v-button>
		</div>

		<v-notice v-if="loadingFileStatus === 'error' && fileError" type="danger">{{ fileError }}</v-notice>
	</div>
</template>

<style lang="scss" scoped>
.preview-btn-actions {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-top: 10px;
}
</style>
