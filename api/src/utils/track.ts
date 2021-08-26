import axios from 'axios';
import ms from 'ms';
import { machineId } from 'node-machine-id';
import os from 'os';
// @ts-ignore
import { version } from '../../package.json';
import env from '../env';
import logger from '../logger';

export async function track(event: string): Promise<void> {
	if (env.TELEMETRY !== false) {
		const info = await getEnvInfo(event);

		try {
			await axios.post('https://telemetry.directus.io/', info);
		} catch (err) {
			if (env.NODE_ENV === 'development') {
				logger.error(err);
			}
		}
	}
}

async function getEnvInfo(event: string) {
	return {
		version: version,
		event: event,
		project_id: env.KEY,
		machine_id: await machineId(),
		environment: env.NODE_ENV,
		stack: 'node',
		os: {
			arch: os.arch(),
			platform: os.platform(),
			release: os.release(),
		},
		rate_limiter: {
			enabled: env.RATE_LIMITER_ENABLED,
			points: +env.RATE_LIMITER_POINTS,
			duration: +env.RATE_LIMITER_DURATION,
			store: env.RATE_LIMITER_STORE,
		},
		cache: {
			enabled: env.CACHE_ENABLED,
			ttl: ms(env.CACHE_TTL),
			store: env.CACHE_STORE,
		},
		storage: {
			drivers: getStorageDrivers(),
		},
		cors: {
			enabled: env.CORS_ENABLED,
		},
		email: {
			transport: env.EMAIL_TRANSPORT,
		},
		oauth: {
			providers: env.OAUTH_PROVIDERS.split(',')
				.map((v: string) => v.trim())
				.filter((v: string) => v),
		},
		db_client: env.DB_CLIENT,
	};
}

function getStorageDrivers() {
	const drivers: string[] = [];
	const locations = env.STORAGE_LOCATIONS.split(',')
		.map((v: string) => v.trim())
		.filter((v: string) => v);

	for (const location of locations) {
		const driver = env[`STORAGE_${location.toUpperCase()}_DRIVER`];
		drivers.push(driver);
	}

	return drivers;
}
