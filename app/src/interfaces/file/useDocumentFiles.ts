import { ComputedRef, Ref, computed, nextTick, ref, watch } from 'vue';
import { FileType, LoadingFileStatus, TextFiles } from './types';
import { useFieldsStore } from '@/stores/fields';
import { FormFieldValues } from '@/types/v-form';
import { GlobalItem } from '@/types/global-item';

import Docxtemplater from 'docxtemplater';
import TxtTemplater from 'docxtemplater/js/text.js';
import expressionParser from "docxtemplater/expressions.js";

import PizZipUtils from 'pizzip/utils';
import PizZip, { LoadData } from 'pizzip';

import { saveAs } from 'file-saver';
import { renderAsync } from 'docx-preview';

import api from '@/api';
import { cloneDeep } from 'lodash';
import { getDateFNSLocale } from '@/utils/get-date-fns-locale';

interface UseDocumentFilesFuncReturn {
	previewDocxRef: Ref<HTMLElement | null>;
	templateTxtText: Ref<string | null>;
	isShowPreview: Ref<boolean>;
	loadingFileStatus: Ref<LoadingFileStatus>;
	error: Ref<string | null>;
	fileType: Ref<FileType>;
	isItemFormEdition: ComputedRef<boolean>;
	downloadDocxTemplate: () => void;
	downloadTxtTemplate: () => void;
	openPreview: () => void;
}

export function useDocumentFiles(
	file: Ref<Record<string, any> | null>,
	formValues: Ref<Record<string, any>> | undefined,
	allowedFiles: TextFiles[],
	collectionName: Ref<string>,
	keyValueStorage: Ref<GlobalItem[]> | null,
	primaryKey: Readonly<Ref<string | number | undefined>>,
	isItemSavable: Readonly<Ref<boolean>>,
	itemEdits: Readonly<Ref<FormFieldValues | null>>,
	fieldName: Readonly<Ref<string>>,
	downloadSuffixes: Readonly<Ref<string | null>>,
	setInterfaceValueToNull: () => void,
): UseDocumentFilesFuncReturn {
	const previewDocxRef = ref<HTMLElement | null>(null);

	const templateDocxBlob = ref<Blob | null>(null);
	const templateTxtBlob = ref<Blob | null>(null);
	const templateTxtText = ref<string | null>(null);
	const templateItemData = ref<Record<string, any> | null>(null);

	const isShowPreview = ref(false);
	const loadingFileStatus = ref<LoadingFileStatus>('');
	const error = ref<string | null>(null);
	const fileType = ref<FileType>(null);

	const fieldsStore = useFieldsStore();

	watch(
		file,
		() => {
			templateDocxBlob.value = null;
			templateTxtBlob.value = null;
			templateTxtText.value = null;
			fileType.value = null;

			if (!file.value) return;

			loadingFileStatus.value = '';
			error.value = null;

			const docxType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
			const txtType = 'text/plain';

			const isDocx = file.value!.type === docxType;
			const isTxt = file.value!.type === txtType;
			const isImg = !isDocx && !isTxt;

			if (allowedFiles.length) {
				if (isDocx && !allowedFiles.includes('.docx')) {
					generateFileError('The file must be of type .txt');
					return;
				}

				if (isTxt && !allowedFiles.includes('.txt')) {
					generateFileError('The file must be of type .docx');
					return;
				}

				if (isImg) {
					const errString = `The file must be of type${allowedFiles.length > 1 ? 's' : ''}: ${allowedFiles.join(', ')}`;
					generateFileError(errString);
					return;
				}
			}

			// if item is being created then we dont show: 1) action buttons: render template nor download template; 2) errors of rendering templates
			if (primaryKey.value === '+') return;

			if (isDocx) {
				fileType.value = '.docx';
				renderDocxTemplate(docxType);
			} else if (isTxt) {
				fileType.value = '.txt';
				renderTxtTemplate();
			}
		},
		{ immediate: true },
	);

	// if there are edits in the item(except the file interface), then we dont show the action buttons(render/download template)
	const isItemFormEdition = computed(() => {
		if (isItemSavable.value && itemEdits.value && Object.keys(itemEdits.value).length) {
			return Object.keys(itemEdits.value).some((key) => key !== fieldName.value);
		}

		return false;
	});

	return {
		// @ts-ignore
		previewDocxRef,
		templateTxtText,
		isShowPreview,
		loadingFileStatus,
		error,
		fileType,
		isItemFormEdition,
		downloadDocxTemplate,
		downloadTxtTemplate,
		openPreview,
	};

	// .DOCX LOGIC
	async function renderDocxTemplate(docxType: string) {
		try {
			error.value = null;

			loadingFileStatus.value = 'loading';

			const token = (api.defaults.headers.common['Authorization'] as string | undefined)?.split(' ')[1] || null;

			const content = await loadDocxFile(`/assets/${file.value!.id}${token ? '?access_token=' + token : ''}`);

			const zip = new PizZip(content as LoadData);

			const doc = new Docxtemplater(zip, {
				paragraphLoop: true,
				linebreaks: true,
				parser: expressionParser,
				nullGetter: (part) => {
					if (part) {
						throw new Error(`Missing field: ${part.value}`);
					}
				},
			});

			const itemId = formValues?.value.id;
			const collName = collectionName.value;

			const item = await api.get(`/items/${collName}/${itemId}?fields=*.*.*`);
			const initialItemData = item.data.data;

			const m2mFields = getM2MFields(collName);

			const itemData = cloneDeep(initialItemData);

			// modify m2m fields data if there are m2m fields
			if (m2mFields.length) {
				modifyM2MFields(m2mFields, itemData, collName, itemId);
			}

			if (keyValueStorage?.value) {
				// add KEYVALUE global storage to the data template
				integrateKeyValueStorageIntoDataTemplate(itemData, keyValueStorage.value);
			}

			// add current_date and current_datetime to the data template
			addDateTimesToTemplate(itemData);

			doc.render(itemData);

			const fileBlob = doc.getZip().generate({
				type: 'blob',
				mimeType: docxType,
				compression: 'DEFLATE',
			});

			templateDocxBlob.value = fileBlob;
			templateItemData.value = itemData;
			loadingFileStatus.value = 'success';
		} catch (err: any) {
			generateFileError(err);
		}
	}

	async function loadDocxFile(url: string) {
		return new Promise((resolve, reject) => {
			PizZipUtils.getBinaryContent(url, (error, content) => {
				if (error) {
					reject(error);
				} else {
					resolve(content);
				}
			});
		});
	}

	function downloadDocxTemplate() {
		if (!downloadSuffixes.value) {
			saveAs(templateDocxBlob.value as Blob, `${file.value?.title} Result.docx`);
			return;
		}

		const suffixesStr = getFileSuffixesValuesByTemplateData(downloadSuffixes.value, templateItemData.value!);

		saveAs(templateDocxBlob.value as Blob, `${file.value?.title}-${suffixesStr}.docx`);
	}
	// ------

	// .TXT LOGIC
	async function renderTxtTemplate() {
		try {
			error.value = null;

			loadingFileStatus.value = 'loading';

			const { data: content } = await api.get(`/assets/${file.value!.id}`);

			const doc = new TxtTemplater(content, {
				paragraphLoop: true,
				linebreaks: true,
				parser: expressionParser,
				nullGetter: (part) => {
					if (part) {
						throw new Error(`Missing field: ${part.value}`);
					}
				},
			});

			const itemId = formValues?.value.id;
			const collName = collectionName.value;

			const item = await api.get(`/items/${collName}/${itemId}?fields=*.*.*`);
			const initialItemData = item.data.data;

			const m2mFields = getM2MFields(collName);

			const itemData = cloneDeep(initialItemData);

			// modify m2m fields data if there are m2m fields
			if (m2mFields.length) {
				modifyM2MFields(m2mFields, itemData, collName, itemId);
			}

			if (keyValueStorage?.value) {
				// add KEYVALUE global storage to the data template
				integrateKeyValueStorageIntoDataTemplate(itemData, keyValueStorage.value);
			}

			// add current_date and current_datetime to the data template
			addDateTimesToTemplate(itemData);

			const result = doc.render(itemData);

			const _templateTxtBlob = new Blob([result], { type: 'text/plain' });

			templateTxtBlob.value = _templateTxtBlob;

			templateTxtText.value = result;

			templateItemData.value = itemData;

			loadingFileStatus.value = 'success';
		} catch (err: any) {
			generateFileError(err);
		}
	}

	function downloadTxtTemplate() {
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(templateTxtBlob.value as Blob);

		if(!downloadSuffixes.value) {
			downloadLink.download = `${file.value?.title} Result.txt`;
		} else {
			const suffixesStr = getFileSuffixesValuesByTemplateData(downloadSuffixes.value, templateItemData.value!);
			downloadLink.download = `${file.value?.title}-${suffixesStr}.txt`
		}

		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}
	// --------------

	function openPreview() {
		isShowPreview.value = true;

		if (fileType.value === '.docx') {
			// inject the .docx preview
			nextTick(() => {
				if (previewDocxRef.value) {
					renderAsync(templateDocxBlob.value, previewDocxRef.value as HTMLElement);
				}
			});
		}
	}

	function getM2MFields(collName: string) {
		const collectionFields = fieldsStore.getFieldsForCollection(collName);

		return collectionFields.filter((field) => field.meta?.special?.includes('m2m')).map((field) => field.field);
	}

	function modifyM2MFields(m2mFields: string[], itemData: Record<string, any>, collName: string, itemId: string) {
		m2mFields.forEach((fieldName) => {
			if (itemData[fieldName] && Array.isArray(itemData[fieldName])) {
				(itemData[fieldName] as Record<string, any>[]).forEach((obj) => {
					for (const key in obj) {
						const isWrongSubObject = key.startsWith(collName) || obj[key]?.id === itemId;

						if (isWrongSubObject || key === 'id') delete obj[key];
					}
				});
			}
		});
	}

	function integrateKeyValueStorageIntoDataTemplate(itemData: Record<string, any>, storage: GlobalItem[]) {
		itemData.KEYVALUE = {};

		storage.forEach((item) => {
			itemData.KEYVALUE[item.key] = item.value;
		});
	}

	function addDateTimesToTemplate(itemData: Record<string, any>) {
		const dateNow = new Date();

		const options: Pick<Intl.DateTimeFormatOptions, 'year' | 'month' | 'day'> = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		};

		const currentLocale = getDateFNSLocale()?.code ?? 'en-US'

		const currentDate = new Intl.DateTimeFormat(currentLocale, options).format(dateNow);
		const isoDateString = dateNow.toISOString();

		itemData.current_date = currentDate;
		itemData.current_datetime = isoDateString;
	}

	function getFileSuffixesValuesByTemplateData(suffixesStr: string, itemData: Record<string, any>) {
		const suffixesArr = suffixesStr.replace(/({|})/g, ' ').trim().split(' ').filter(Boolean);

		return suffixesArr.map((suffix) => {
			const keys = suffix.split('.');
			const value = keys.reduce((acc, key) => acc?.[key], itemData);
			return value !== undefined && value !== null && typeof value !== 'object' ? value : 'undefined';
		}).join('-');
	}

	function generateFileError(err: string) {
		loadingFileStatus.value = 'error';
		error.value = err;
		file.value = null;
		setInterfaceValueToNull();
	}
}
