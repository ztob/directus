<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface Choice {
	text: string;
	value: string | number | boolean;
}

interface Props {
	fieldName: string
	isDisabled: boolean;
	choices: Choice[]
}

const props = defineProps<Props>();

defineEmits(['create-dropdown-bookmarks']);

const { t } = useI18n();

const dialogOpen = ref(false)
const _choices = ref(props.choices.map(choice => choice.value))

function getSelectedChoices() {
	return props.choices.filter(c => _choices.value.includes(c.value))
}
</script>

<!-- LOGIC FOR CREATING BOOKMARKS FOR SELECT-DROPDOWN COMPONENT -->

<template>
	<v-dialog v-model="dialogOpen" @esc="dialogOpen = false">
		<template #activator="{ on }">
			<v-button v-tooltip.bottom="t('Create Bookmarks From Dropdown')" class="create-bookmarks-btn" :disabled="isDisabled"
				@click="on">
				{{ t('Create Bookmarks') }}
			</v-button>
		</template>
		<v-card>
			<v-card-title>{{ t('Create Bookmarks From Dropdown Options') }}</v-card-title>

			<v-card-text>
				<interface-select-multiple-checkbox :value="_choices" :choices="choices" width="half"
					@input="_choices = $event" />
			</v-card-text>

			<v-card-actions>
				<v-button secondary @click="dialogOpen = false">
					{{ t('cancel') }}
				</v-button>

				<v-button :disabled="!_choices.length" @click="$emit(
					'create-dropdown-bookmarks',
					fieldName, getSelectedChoices()
				)">
					{{ t('create') }}
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<style lang="scss" scoped>
.create-bookmarks-btn {
	padding-top: 10px;
}
</style>
