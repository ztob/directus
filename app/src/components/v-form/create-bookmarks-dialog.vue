<script setup lang="ts">
import { computed, Ref, ref, toRefs, watch, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { FieldChoice } from './types';

type FieldInterfaceType = string | null | undefined
type FieldModelValueType = string[] | string | null

interface Props {
	fieldName: string;
	isBookmarkBtnDisabled: boolean;
	choices: FieldChoice[];
	fieldInterface: FieldInterfaceType;
	fieldModelValue: FieldModelValueType;
	isAllowOther: boolean | null;
}

const props = defineProps<Props>();

defineEmits(['create-field-bookmarks']);

const { t } = useI18n();

const { fieldModelValue, isAllowOther } = toRefs(props)

const dialogOpen = ref(false)
const isShowItemsCount = ref(true)

const { allChoices, checkedChoices, selectedChoicesForBookmarks } = configureDialogChoices(
	toRef(() => props.choices),
	props.fieldInterface,
	fieldModelValue,
	isAllowOther
)

function configureDialogChoices(
	choices: Ref<FieldChoice[]>,
	fieldInterface: FieldInterfaceType,
	fieldModelValue: Ref<FieldModelValueType>,
	isAllowOther: Ref<boolean | null>
) {
	const _choices = ref(choices.value)

	watch(choices, () => _choices.value = choices.value)

	// get all of the choices including the other custom choices
	const allChoices = computed({
		get() {
			const fieldModelVal = fieldModelValue.value

			if (fieldModelVal && isAllowOther.value) {
				if (Array.isArray(fieldModelVal)) {
					const otherChoices = fieldModelVal.map(choiceStr => ({ text: choiceStr, value: choiceStr }))

					return removeSameChoices([..._choices.value, ...otherChoices])
				}

				if (typeof fieldModelVal === 'string') {
					const otherChoice = {
						text: fieldModelVal,
						value: fieldModelVal
					}

					return removeSameChoices([..._choices.value, otherChoice])
				}
			}

			return _choices.value

			function removeSameChoices(choices: FieldChoice[]) {
				return choices.filter((choice, index, self) => {
					const existingChoice = self.findIndex(c => c.value === choice.value);
					return existingChoice === index;
				});
			}
		},
		set(newChoices) {
			_choices.value = newChoices
		}
	})

	// get the choices for select-multiple-checkbox-tree comp because it has nested children choices
	if (fieldInterface === 'select-multiple-checkbox-tree') {
		allChoices.value = getCheckboxTreeChoices(choices.value)
	}

	const _checkedChoices = ref(allChoices.value.map(choice => choice.value))

	const checkedChoices = computed({
		get() {
			return _checkedChoices.value
		},
		set(val) {
			_checkedChoices.value = val
		}
	})

	// initially check all of the choices
	watch(allChoices, (newValue) => {
		_checkedChoices.value = newValue.map(choice => choice.value)
	})

	// get the choices to create the bkmrks from
	const selectedChoicesForBookmarks = computed(() => {
		return allChoices.value.filter(choice => checkedChoices.value.includes(choice.value))
	})

	return { allChoices, checkedChoices, selectedChoicesForBookmarks }

	function getCheckboxTreeChoices(choices: FieldChoice[], configuredChoices: FieldChoice[] = []) {
		for (const choice of choices) {
			configuredChoices.push(choice);

			if (choice.children) {
				getCheckboxTreeChoices(choice.children, configuredChoices);
			}
		}

		return configuredChoices;
	}
}
</script>

<!-- LOGIC FOR CREATING BOOKMARKS FOR SELECTION COMPONENTS WHEN BROWSING COLLS ITEMS-->

<template>
	<v-dialog v-model="dialogOpen" @esc="dialogOpen = false">
		<template #activator="{ on }">
			<v-button small icon :disabled="isBookmarkBtnDisabled" @click="on">
				<v-icon v-tooltip.bottom="t('create_bookmark')" name="bookmark" />
			</v-button>
		</template>
		<v-card>
			<v-card-title>{{ t('Create Bookmarks From Dropdown Options') }}</v-card-title>

			<v-card-text>
				<div class="checkboxes">
					<interface-select-multiple-checkbox :value="checkedChoices" :choices="allChoices" width="half"
						@input="checkedChoices = $event" />
				</div>

				<v-divider />

				<div class="show-items-bool">
					<interface-boolean :value="isShowItemsCount" label="Show Items Count" @input="isShowItemsCount = $event" />
				</div>
			</v-card-text>

			<v-card-actions>
				<v-button secondary @click="dialogOpen = false">
					{{ t('cancel') }}
				</v-button>

				<v-button :disabled="!checkedChoices?.length" @click="$emit(
					'create-field-bookmarks',
					fieldName, selectedChoicesForBookmarks, isShowItemsCount
				)">
					{{ t('create') }}
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<style lang="scss" scoped>
.checkboxes {
	margin-bottom: 10px;
}

.show-items-bool {
	margin-top: 10px;
}
</style>
