import type { Extension } from '@directus/extensions';
import { getLocalExtensions, getPackageExtensions, resolvePackageExtensions } from '@directus/extensions/node';
import env from '../../env.js';
import { getExtensionsPath } from './get-extensions-path.js';

export const getExtensions = async () => {
	const localExtensions = await getLocalExtensions(getExtensionsPath());

	const loadedNames = localExtensions.map(({ name }) => name);

	const filterDuplicates = ({ name }: Extension) => loadedNames.includes(name) === false;

	const localPackageExtensions = (await resolvePackageExtensions(getExtensionsPath())).filter((extension) =>
		filterDuplicates(extension),
	);

	loadedNames.push(...localPackageExtensions.map(({ name }) => name));

	const packageExtensions = (await getPackageExtensions(env['PACKAGE_FILE_LOCATION'])).filter((extension) =>
		filterDuplicates(extension),
	);

	return [...packageExtensions, ...localPackageExtensions, ...localExtensions];
};
