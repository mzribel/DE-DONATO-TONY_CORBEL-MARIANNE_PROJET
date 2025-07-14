import { ref } from "vue";
import * as SettingsService from "../services/supabase/settingsService";
import { Settings } from "../types/settings";

const settings = ref(null);
const loading = ref(false);

export function useSettings() {
    async function loadSettings(userId:string):Promise<void> {
        loading.value = true;
        settings.value = await SettingsService.getSettings(userId);
        loading.value = false;
    }

    async function updateSettings(newSettings:Partial<Settings>, userId:string):Promise<void> {
        settings.value = await SettingsService.updateSettings(newSettings, userId);
    }

    async function resetSettings(userId:string):Promise<void> {
        settings.value = await SettingsService.resetSettings(userId);
    }

    return {
        settings,
        loading,
        loadSettings,
        updateSettings,
        resetSettings,
    };
}
