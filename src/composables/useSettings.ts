import { ref } from "vue";
import {SettingsDTO} from "../../types/settings";

const settings = ref(null);
const loading = ref(false);

export function useSettings() {
    async function loadSettings():Promise<void> {
        loading.value = true;
        settings.value = await window.electronAPI.getSettings();
        loading.value = false;
    }

    async function updateSettings(newSettings:Partial<SettingsDTO>):Promise<void> {
        settings.value = await window.electronAPI.updateSettings(newSettings);
    }

    async function resetSettings():Promise<void> {
        settings.value = await window.electronAPI.resetSettings();
    }

    return {
        settings,
        loading,
        loadSettings,
        updateSettings,
        resetSettings,
    };
}
