import { ref } from 'vue';
import * as SettingsService from '../services/supabase/settingsService';
import type { Settings } from '../types/settings';
import { useAuth } from './useAuth';

export function useSettings() {
    const settings = ref<Settings | null>(null);
    const loading = ref(false);

    const { userId } = useAuth();

    async function loadSettings(): Promise<void> {
        if (!userId.value) return;
        loading.value = true;
        settings.value = await SettingsService.getSettings(userId.value);
        loading.value = false;
    }

    async function updateSettings(newSettings: Partial<Settings>): Promise<void> {
        if (!userId.value) return;
        settings.value = await SettingsService.updateSettings(newSettings, userId.value);
    }

    async function resetSettings(): Promise<void> {
        if (!userId.value) return;
        settings.value = await SettingsService.resetSettings(userId.value);
    }

    return {
        settings,
        loading,
        loadSettings,
        updateSettings,
        resetSettings,
    };
}
