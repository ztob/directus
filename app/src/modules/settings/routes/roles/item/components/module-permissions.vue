<template>
    <div class="module-permissions">
        <interface-presentation-divider title="Allowed Modules" icon="menu_open" />

        <v-list class="list">
            <v-list-item v-for="mod in module_bar" block :class="{ enabled: mod.allowed }">
                <v-icon class="icon" :name="mod.icon ?? 'extension'" />
                <div class="info">
                    <div class="name">{{ mod.name }}</div>
                    <div class="to">{{ mod.to }}</div>
                </div>
                <div class="spacer" />
                <v-icon :name="mod.allowed ? 'check_box' : 'check_box_outline_blank'" clickable @click.stop="toggleAllowed(mod.id)" />
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { computed } from 'vue';
import { translate } from '@/utils/translate-object-values';
import { useExtensions } from '@/extensions';

type ModuleBarItem = {
    id: string;
    name: string;
    type: 'module' | 'link';
    enabled: boolean;
    url?: string;
    icon?: string;
    children?: ModuleBarItem[];
    disallowed_roles?: string[];
};

type PreviewExtra = {
    to: string;
	name: string;
	icon: string;
};

const props = defineProps<{
    roleId: string;
}>();


const settingsStore = useSettingsStore();
const { modules: registeredModules } = useExtensions();

const module_bar = computed(() => {
    return settingsStore.settings?.module_bar.map(value => {
        const _value = value as unknown as ModuleBarItem;
        return {
            ..._value,
            ...moduleToPreview(_value),
            allowed: !_value.disallowed_roles?.includes(props.roleId),
        };
    }) ?? [];
});

function moduleToPreview(mod: ModuleBarItem): PreviewExtra {
    if (mod.type === 'link') {
        return {
            to: mod.url!,
            name: translate(mod.name),
            icon: mod.icon!,
        };
    }

    const registered = registeredModules.value.find((module) => module.id === mod.id);
    if (!registered) {
        return {
            to: `/${mod.id}`,
            name: mod.id,
            icon: 'extension',
        };
    }
    return {
        to: `/${mod.id}`,
        name: registered.name,
        icon: registered.icon,
    };
}

function previewToModule(mod: ModuleBarItem & PreviewExtra): Partial<ModuleBarItem> {
    const res: Partial<ModuleBarItem> = {
        type: mod.type,
        id: mod.id,
        enabled: mod.enabled,

        name: mod.name,
        url: mod.url,
        icon: mod.icon,

        disallowed_roles: mod.disallowed_roles,
    };
    return res;
}

function toggleAllowed(moduleId: string) {
    const module = module_bar.value.find((mod) => mod.id === moduleId);
    if (!module) {
        return;
    }
    let disallowed_roles = module.disallowed_roles ?? [];

    if (module.allowed) {
        disallowed_roles = disallowed_roles.concat(props.roleId);
    } else {
        disallowed_roles = disallowed_roles.filter((role) => role !== props.roleId);
    }

    settingsStore.updateSettings({
        module_bar: module_bar.value.map((mod) => {
            const value = previewToModule(mod);
            if (value.id === moduleId) {
                return {
                    ...value,
                    disallowed_roles,
                };
            }
            return value;
        }),
    });
}
</script>

<style scoped>
.module-permissions {
    width: calc(2 * var(--form-column-max-width) + var(--form-vertical-gap) - 8px);
    display: flex;
    flex-direction: column;
    row-gap: var(--form-horizontal-gap);
    margin-top: var(--form-horizontal-gap);
}

.icon {
	margin: 0 12px;
}

.v-list-item.enabled {
	--v-list-item-border-color: var(--primary);
	--v-list-item-color: var(--primary-125);
	--v-list-item-background-color: var(--primary-10);
	--v-list-item-border-color-hover: var(--primary-150);
	--v-list-item-color-hover: var(--primary-125);
	--v-list-item-background-color-hover: var(--primary-10);
	--v-icon-color: var(--primary);
	--v-icon-color-hover: var(--foreground-normal);
}

.to {
	color: var(--foreground-subdued);
	font-family: var(--family-monospace);
}

.enabled .to {
	color: var(--primary-50);
}

.list {
	margin-bottom: 8px;
	padding: 0;
}
</style>