import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Notifications
    notify: (title: string, body: string) => ipcRenderer.invoke('notify', { title, body }),
    // Reset du mot de passe
    onRecoveryToken: (callback: (token: string) => void) => {
        ipcRenderer.on('recovery-token', (_event, token) => callback(token));
    },
    // Suppression du compte
    deleteAccount: (token: string) => ipcRenderer.invoke('delete-account', token),
});
