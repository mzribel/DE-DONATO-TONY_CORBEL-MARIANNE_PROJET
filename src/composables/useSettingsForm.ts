import { computed, ref, watch } from 'vue';
import { useSettings } from './useSettings';
import type { Settings } from '../types/Settings';

export function useSettingsForm() {
    const {
        settings,
        loading,
        loadSettings,
        updateSettings,
        resetSettings,
    } = useSettings();

    const localSettings = ref<Settings | null>(null);
    const saving = ref(false);

    // Synchronisation initiale
    watch(settings, (newSettings) => {
        if (newSettings) {
            // Seule manière de cloner une ref
            localSettings.value = JSON.parse(JSON.stringify(newSettings));
        }
    }, { immediate: true });

    const hasChanged = computed(() => {
        if (!settings.value || !localSettings.value) return false;
        return JSON.stringify(settings.value) !== JSON.stringify(localSettings.value);
    });

    async function saveChanges(userId:string) {
        if (!localSettings.value) return;
        saving.value = true;
        try {
            await updateSettings(localSettings.value, userId);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
        } finally {
            saving.value = false;
        }
    }

    function cancelChanges() {
        if (settings.value) {
            localSettings.value = structuredClone(settings.value);
        }
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
