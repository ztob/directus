import api, { resumeQueue } from '@/api';
import { DEFAULT_AUTH_PROVIDER } from '@/constants';
import { dehydrate, hydrate } from '@/hydrate';
import { translateAPIError } from '@/lang';
import { router } from '@/router';
import { useUserStore } from '@/stores/user';
import { notify } from '@/utils/notify';
import { useAppStore } from '@directus/stores';
import { AxiosError } from 'axios';
import { RouteLocationRaw } from 'vue-router';
import { idleTracker } from './idle';

type LoginCredentials = {
	identifier?: string;
	id?: string;
	email?: string;
	password?: string;
	otp?: string;
	share?: string;
};

type LoginParams = {
	credentials: LoginCredentials;
	provider?: string;
	share?: boolean;
	redirect?: boolean;
};

function getAuthEndpoint(provider?: string, share?: boolean) {
	if (share) return '/shares/auth';
	if (provider === DEFAULT_AUTH_PROVIDER) return '/auth/login';

	return `/auth/login/${provider}`;
}

export async function login({ credentials, provider, share, redirect = true }: LoginParams): Promise<void> {
	const appStore = useAppStore();
	const userStore = useUserStore();

	const isSwitchingUser = credentials.id != null;

	let response: {
		data: {
			data: {
				access_token: any;
				expires: number;
			};
		};
	};

	try {
		response = await api.post<any>(getAuthEndpoint(provider, share), {
			...credentials,

			mode: 'cookie',
		});
	} catch (error: AxiosError) {
		if (isSwitchingUser) {
			await logout({
				reason: LogoutReason.ADD_USER,
			});
		} else {
			notify({
				error,
				type: 'error',
				title: translateAPIError(error),
			});
		}

		return;
	}

	const accessToken = response.data.data.access_token;

	// Add the header to the API handler for every request
	api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

	// Refresh the token 10 seconds before the access token expires. This means the user will stay
	// logged in without any noticeable hiccups or delays

	// setTimeout breaks with numbers bigger than 32bits. This ensures that we don't try refreshing
	// for tokens that last > 24 days. Ref #4054
	if (response.data.data.expires <= 2100000000) {
		refreshTimeout = setTimeout(() => refresh(), response.data.data.expires - 10000);
	}

	appStore.accessTokenExpiry = Date.now() + response.data.data.expires;
	appStore.authenticated = true;

	if (isSwitchingUser) {
		userStore.saveCurrentUser();
	}

	await hydrate(isSwitchingUser);

	userStore.unsaveCurrentUser();

	if (redirect) {
		const redirectQuery = router.currentRoute.value.query.redirect as string;

		let lastPage: string | null | undefined;

		if (userStore.currentUser && 'last_page' in userStore.currentUser) {
			lastPage = userStore.currentUser.last_page;
		}

		router.push(redirectQuery || lastPage || '/content');
	}
}

let refreshTimeout: any;
let idle = false;
let isRefreshing = false;
let firstRefresh = true;

// Prevent the auto-refresh when the app isn't in use
idleTracker.on('idle', () => {
	clearTimeout(refreshTimeout);
	idle = true;
});

idleTracker.on('hide', () => {
	clearTimeout(refreshTimeout);
	idle = true;
});

// Restart the autorefresh process when the app is used (again)
idleTracker.on('active', () => {
	if (idle === true) {
		refresh();
		idle = false;
	}
});

idleTracker.on('show', () => {
	if (idle === true) {
		refresh();
		idle = false;
	}
});

export async function refresh({ navigate }: LogoutOptions = { navigate: true }): Promise<string | undefined> {
	// Allow refresh during initial page load
	if (firstRefresh) firstRefresh = false;
	// Skip if not logged in
	else if (!api.defaults.headers.common['Authorization']) return;

	// Prevent concurrent refreshes
	if (isRefreshing) return;

	const appStore = useAppStore();

	// Skip refresh if access token is still fresh
	if (appStore.accessTokenExpiry && Date.now() < appStore.accessTokenExpiry - 10000) {
		// Set a fresh timeout as it is cleared by idleTracker's idle or hide event
		clearTimeout(refreshTimeout);
		refreshTimeout = setTimeout(() => refresh(), appStore.accessTokenExpiry - 10000 - Date.now());
		return;
	}

	isRefreshing = true;

	try {
		const response = await api.post<any>('/auth/refresh', undefined, {
			transformRequest(data, headers) {
				// Remove Authorization header from request
				headers.set('Authorization');
				return data;
			},
		});

		const accessToken = response.data.data.access_token;

		// Add the header to the API handler for every request
		api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

		// Refresh the token 10 seconds before the access token expires. This means the user will stay
		// logged in without any notable hiccups or delays
		clearTimeout(refreshTimeout);

		// setTimeout breaks with numbers bigger than 32bits. This ensures that we don't try refreshing
		// for tokens that last > 24 days. Ref #4054
		if (response.data.data.expires <= 2100000000) {
			refreshTimeout = setTimeout(() => refresh(), response.data.data.expires - 10000);
		}

		appStore.accessTokenExpiry = Date.now() + response.data.data.expires;
		appStore.authenticated = true;

		return accessToken;
	} catch (error: any) {
		await logout({
			navigate,
			reason: LogoutReason.SESSION_EXPIRED,
		});
	} finally {
		isRefreshing = false;

		resumeQueue();
	}
}

export enum LogoutReason {
	ADD_USER = 'ADD_USER',
	SIGN_OUT = 'SIGN_OUT',
	SESSION_EXPIRED = 'SESSION_EXPIRED',
}

export type LogoutOptions = {
	navigate?: boolean;
	reason?: LogoutReason;
};

/**
 * Everything that should happen when someone logs out, or is logged out through an external factor
 */
export async function logout(optionsRaw: LogoutOptions = {}): Promise<void> {
	const appStore = useAppStore();
	const userStore = useUserStore();

	const defaultOptions: Required<LogoutOptions> = {
		navigate: true,
		reason: LogoutReason.SIGN_OUT,
	};

	delete api.defaults.headers.common['Authorization'];

	clearTimeout(refreshTimeout);

	const options = { ...defaultOptions, ...optionsRaw };

	if (options.reason === LogoutReason.ADD_USER || options.reason === LogoutReason.SIGN_OUT) {
		try {
			await api.post('/auth/logout', {
				reason: options.reason,
			});
		} catch {
			/* empty */
		}
	}

	appStore.authenticated = false;

	const isAddingUser = options.reason === LogoutReason.ADD_USER;

	if (isAddingUser) {
		userStore.saveCurrentUser();
	}

	await dehydrate();

	if (options.navigate === true) {
		const location: RouteLocationRaw = {
			path: `/login`,
			query: {
				reason: options.reason,
			},
		};

		await router.push(location);
	}
}
