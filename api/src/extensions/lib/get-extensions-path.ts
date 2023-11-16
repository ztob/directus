import { join } from 'path';
import env from '../../env.js';

export const getExtensionsPath = () => {
	if (env['EXTENSIONS_LOCATION']) {
		return join(env['TEMP_PATH'], 'extensions');
	}

	return env['EXTENSIONS_PATH'];
};
