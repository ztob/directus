
<!-- COPPY COLLECTION LOGIC -->

<script setup lang="ts">
defineProps<{
	confirmCopy: boolean;
	isCopyBtnDisabled: boolean;
	copyName: string | null;
	savingCopy: boolean;
}>();

defineEmits(['update:confirm-copy', 'update:copy-name', 'cancel', 'create-copy']);

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
	<v-dialog :model-value="confirmCopy" @update:model-value="$emit('update:confirm-copy', $event)"
		@esc="$emit('update:confirm-copy', $event)">
		<template #activator="{ on }">
			<v-button v-tooltip.bottom="t('Copy Collection')" :disabled="isCopyBtnDisabled" rounded icon @click="on">
				<v-icon name="content_copy" />
			</v-button>
		</template>

		<v-card>
			<v-card-title>{{ t('Create a copy of this collection') }}</v-card-title>

			<v-card-text>
				<v-input :model-value="copyName" db-safe autofocus full-width :placeholder="t('Collection Name...')"
					@update:model-value="$emit('update:copy-name', $event)" />
			</v-card-text>

			<v-card-actions>
				<v-button secondary @click="$emit('cancel', $event)">
					{{ t('cancel') }}
				</v-button>
				<v-button :loading="savingCopy" :disabled="!copyName" @click="$emit('create-copy', $event)">
					{{ t('copy') }}
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
