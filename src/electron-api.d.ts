export {};

declare global {
    interface Window {
        electronAPI: {
            notify: (title: string, body: string) => void,
            getSettings: () => Promise<SettingsDTO>,
            updateSettings: (newSettings: Partial<SettingsDTO>) => Promise<SettingsDTO>,
            resetSettings: () => Promise<SettingsDTO>

            // Historique des sessions
            saveSession: (sessionData: any) => Promise<void>;
            getSessions: (userId: any) => Promise<any[]>;

        };
    }
}
