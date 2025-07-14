import { computed, ref, watch, Ref } from 'vue';
import type { Settings } from '../types/settings';
import * as SettingsService from '../services/supabase/settingsService';

export function useSettingsForm(settings: Ref<Settings | null>) {
    const localSettings = ref<Settings | null>(null);
    const loading = ref(false);
    const saving = ref(false);

    watch(settings, (newSettings) => {
        if (newSettings) {
            localSettings.value = JSON.parse(JSON.stringify(newSettings));
        }
    }, { immediate: true });

    const hasChanged = computed(() => {
        if (!settings.value || !localSettings.value) return false;
        return JSON.stringify(settings.value) !== JSON.stringify(localSettings.value);
    });

    async function loadSettings(userId: string): Promise<void> {
        loading.value = true;
        settings.value = await SettingsService.getSettings(userId);
        loading.value = false;
    }

    async function saveChanges(userId: string): Promise<void> {
        if (!localSettings.value) return;
        saving.value = true;
        try {
            settings.value = await SettingsService.updateSettings(localSettings.value, userId);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
        } finally {
            saving.value = false;
        }
    }

    function cancelChanges() {
        if (settings.value) {
            localSettings.value = JSON.parse(JSON.stringify(settings.value));
        }
    }

    async function resetSettings(userId: string): Promise<void> {
        settings.value = await SettingsService.resetSettings(userId);
    }

    return {
        settings,
        localSettings,
        loading,
        saving,
        hasChanged,
        loadSettings,
        saveChanges,
        cancelChanges,
        resetSettings
    };
}
