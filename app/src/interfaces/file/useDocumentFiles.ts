import { Ref, nextTick, ref, watch } from 'vue';
import { FileType, LoadingFileStatus, TextFiles } from './types';
import { useFieldsStore } from '@/stores/fields';

import Docxtemplater from 'docxtemplater';
import TxtTemplater from 'docxtemplater/js/text.js';

import PizZipUtils from 'pizzip/utils';
import PizZip, { LoadData } from 'pizzip';

import { saveAs } from 'file-saver';
import { renderAsync } from 'docx-preview';

import api from '@/api';
import { cloneDeep } from 'lodash';

interface UseDocumentFilesFuncReturn {
	previewDocxRef: Ref<HTMLElement | null>;
	templateTxtText: Ref<string | null>;
	isShowPreview: Ref<boolean>;
	loadingFileStatus: Ref<LoadingFileStatus>;
	error: Ref<string | null>;
	fileType: Ref<FileType>;
	downloadDocxTemplate: () => void;
	downloadTxtTemplate: () => void;
	openPreview: () => void;
}

export function useDocumentFiles(
	file: Ref<Record<string, any> | null>,
	formValues: Ref<Record<string, any>> | undefined,
	allowedFiles: TextFiles[],
	collectionName: Ref<string>,
	setInterfaceValueToNull: () => void,
): UseDocumentFilesFuncReturn {
	const previewDocxRef = ref<HTMLElement | null>(null);

	const templateDocxBlob = ref<Blob | null>(null);
	const templateTxtBlob = ref<Blob | null>(null);
	const templateTxtText = ref<string | null>(null);

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

	return {
		// @ts-ignore
		previewDocxRef,
		templateTxtText,
		isShowPreview,
		loadingFileStatus,
		error,
		fileType,
		downloadDocxTemplate,
		downloadTxtTemplate,
		openPreview,
	};

	// .DOCX LOGIC
	async function renderDocxTemplate(docxType: string) {
		try {
			error.value = null;

			loadingFileStatus.value = 'loading';

			const content = await loadDocxFile(`/assets/${file.value!.id}`);

			const zip = new PizZip(content as LoadData);

			const doc = new Docxtemplater(zip, {
				paragraphLoop: true,
				linebreaks: true,
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

			doc.render(itemData);

			const fileBlob = doc.getZip().generate({
				type: 'blob',
				mimeType: docxType,
				compression: 'DEFLATE',
			});

			templateDocxBlob.value = fileBlob;
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
		saveAs(templateDocxBlob.value as Blob, `item ${formValues?.value.id}.docx`);
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

			const result = doc.render(itemData);

			const _templateTxtBlob = new Blob([result], { type: 'text/plain' });

			templateTxtBlob.value = _templateTxtBlob;

			templateTxtText.value = result;

			loadingFileStatus.value = 'success';
		} catch (err: any) {
			generateFileError(err);
		}
	}

	function downloadTxtTemplate() {
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(templateTxtBlob.value as Blob);
		downloadLink.download = `item ${formValues?.value.id}.txt`;
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
			// eslint-disable-next-line no-prototype-builtins
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

	function generateFileError(err: string) {
		loadingFileStatus.value = 'error';
		error.value = err;
		file.value = null;
		setInterfaceValueToNull();
	}
}
