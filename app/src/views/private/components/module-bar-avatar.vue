<script setup lang="ts">
import { addTokenToURL } from '@/api';
import { useNotificationsStore } from '@/stores/notifications';
import { useUserStore } from '@/stores/user';
import { getRootPath } from '@/utils/get-root-path';
import { useAppStore } from '@directus/stores';
import { User } from '@directus/types';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { login, logout, LogoutReason } from '@/auth';
import { userName } from '@/utils/user-name';
import { DEFAULT_AUTH_PROVIDER } from '@/constants';

const { t } = useI18n();

const appStore = useAppStore();
const notificationsStore = useNotificationsStore();

const { notificationsDrawerOpen } = storeToRefs(appStore);
const { unread } = storeToRefs(notificationsStore);

const userStore = useUserStore();

const signOutActive = ref(false);

const avatarURL = computed<string | null>(() => {
	if (!userStore.currentUser || !('avatar' in userStore.currentUser) || !userStore.currentUser?.avatar) return null;

	return addTokenToURL(`${getRootPath()}assets/${userStore.currentUser.avatar.id}?key=system-medium-cover`);
});

const avatarError = ref<null | Event>(null);

const userProfileLink = computed<string>(() => {
	const id = (userStore.currentUser as User).id;

	return `/users/${id}`;
});

const signOutLink = computed<string>(() => {
	return `/logout`;
});

const userFullName = userStore.fullName ?? undefined;
</script>

<template>
	<div class="module-bar-avatar">
		<v-badge :value="unread" :disabled="unread == 0" class="notifications-badge">
			<v-button
				v-tooltip.right="t('notifications')"
				tile
				icon
				x-large
				class="notifications"
				@click="notificationsDrawerOpen = true"
			>
				<v-icon name="notifications" />
			</v-button>
		</v-badge>

		<v-hover v-slot="{ hover }">
			<transition name="user-actions">
				<div v-if="hover" class="user-actions">
					<v-button
						v-tooltip.right="t('add_user')"
						tile
						icon
						x-large
						class="add-user"
						@click="
							logout({
								reason: LogoutReason.ADD_USER,
							})
						"
					>
						<v-icon name="person_add" />
					</v-button>

					<div v-if="userStore.savedUsers.length" class="saved-users">
						<v-button
							v-for="savedUser in userStore.savedUsers"
							:key="savedUser.id"
							v-tooltip.right="`${userName(savedUser)} - ${savedUser.email}`"
							x-small
							tile
							@click="
								login({
									credentials: {
										id: savedUser.id,
									},
									provider: DEFAULT_AUTH_PROVIDER,
								})
							"
						>
							<span>
								{{ savedUser.first_name.charAt(0).toUpperCase() }}
							</span>

							<span>
								{{ savedUser.last_name.charAt(0).toUpperCase() }}
							</span>
						</v-button>
					</div>

					<v-dialog v-model="signOutActive" @esc="signOutActive = false">
						<template #activator="{ on }">
							<v-button v-tooltip.right="t('sign_out')" tile icon x-large class="sign-out" @click="on">
								<v-icon name="logout" />
							</v-button>
						</template>

						<v-card>
							<v-card-title>{{ t('sign_out_confirm') }}</v-card-title>

							<v-card-actions>
								<v-button secondary @click="signOutActive = !signOutActive">
									{{ t('cancel') }}
								</v-button>

								<v-button :to="signOutLink">{{ t('sign_out') }}</v-button>
							</v-card-actions>
						</v-card>
					</v-dialog>
				</div>
			</transition>

			<router-link :to="userProfileLink">
				<v-avatar v-tooltip.right="userFullName" tile large :class="{ 'no-avatar': !avatarURL }">
					<img
						v-if="avatarURL && !avatarError"
						:src="avatarURL"
						:alt="userFullName"
						class="avatar-image"
						@error="avatarError = $event"
					/>

					<v-icon v-else name="account_circle" />
				</v-avatar>
			</router-link>
		</v-hover>
	</div>
</template>

<style lang="scss" scoped>
.module-bar-avatar {
	position: relative;

	.v-button,
	.v-avatar {
		--v-button-color: var(--theme--navigation--modules--button--foreground);
		--v-button-color-hover: var(--theme--navigation--modules--button--foreground-hover);
		--v-button-background-color: var(--theme--navigation--modules--background);
		--v-button-background-color-hover: var(--theme--navigation--modules--background);
	}

	.v-avatar {
		--v-avatar-color: var(--theme--navigation--modules--background);

		position: relative;
		z-index: 3;
		overflow: visible;

		.avatar-image {
			opacity: 0.8;
			transition: opacity var(--fast) var(--transition);
		}

		&.no-avatar {
			&::after {
				position: absolute;
				top: -1px;
				right: 8px;
				left: 8px;
				height: var(--theme--border-width);
				background-color: var(--theme--navigation--modules--button--foreground);
				opacity: 0.25;
				content: '';
			}
		}

		.v-icon {
			--v-icon-color: var(--theme--navigation--modules--button--foreground);
		}

		&:hover {
			.avatar-image {
				opacity: 1;
			}

			.v-icon {
				--v-icon-color: var(--theme--navigation--modules--button--foreground-hover);
			}
		}
	}

	.notifications-badge {
		--v-badge-offset-x: 16px;
		--v-badge-offset-y: 16px;
	}

	.user-actions {
		position: absolute;
		bottom: 60px;
		left: 0;
		z-index: 2;

		&.user-actions-enter-active,
		&.user-actions-leave-active {
			transition: all var(--fast) var(--transition);
		}

		&.user-actions-enter-from,
		&.user-actions-leave-to {
			transform: translateY(20px);
			opacity: 0;
		}

		.saved-users {
			border-top: 1px solid rgba(129, 150, 177, 0.25);
			border-bottom: 1px solid rgba(129, 150, 177, 0.25);

			.v-button {
				height: 60px;
				border-bottom: 1px solid rgba(129, 150, 177, 0.25);

				&:last-child {
					border: none;
				}
			}
		}
	}
}
</style>
