export {};

declare global {
    interface Window {
        electronAPI: {
            // Notifications
            notify: (title: string, body: string) => Promise<void>;

            // Historique des sessions
            saveSession: (sessionData: any) => Promise<void>;
            getSessions: (userId: any) => Promise<any[]>;

            // Settings
            saveSettings: (settings: any) => Promise<void>;
            getSettings: (userId: any) => Promise<any>;

        };
    }
}
