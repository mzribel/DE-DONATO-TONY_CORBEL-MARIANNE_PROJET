import { ref } from "vue";
import * as SettingsService from "../services/supabase/settingsService"
import { Settings } from "../types/Settings";

const settings = ref(null);
const loading = ref(false);

export function useSettings() {
    async function loadSettings():Promise<void> {
        loading.value = true;
        settings.value = await SettingsService.getSettings();
        loading.value = false;
    }

    async function updateSettings(newSettings:Partial<Settings>):Promise<void> {
        settings.value = await SettingsService.updateSettings(newSettings);
    }

    async function resetSettings():Promise<void> {
        settings.value = await SettingsService.resetSettings();
    }

    return {
        settings,
        loading,
        loadSettings,
        updateSettings,
        resetSettings,
    };
}
