import { contextBridge, ipcRenderer } from 'electron';

/**
 * PRELOAD
 * ----------
 * Sert de pont sécurisé entre le main process (Electron/Node) et le renderer (Vue).
 * Comme nous avons `contextIsolation: true` et `nodeIntegration: false` pour la sécurité,
 * le renderer n'a pas accès directement aux modules Node/Electron.
 *
 * Le preload expose uniquement les APIs nécessaires (ex: IPC notifications)
 * au renderer via `window.electronAPI`, de manière contrôlée et sécurisée,
 * tout en protégeant l'application des failles d'injection.
 */

contextBridge.exposeInMainWorld('electronAPI', {
    // Notifications
    notify: (title: string, body: string) => ipcRenderer.invoke('notify', { title, body }),

    // Database operations
    saveSession: (sessionData: any) => ipcRenderer.invoke('db:saveSession', sessionData),
    getSessions: (userId?: string) => ipcRenderer.invoke('db:getSessions', userId),

    // User preferences
    saveSettings: (userId: string, settings: any) => ipcRenderer.invoke('store:saveSettings', { userId, settings }),
    getSettings: (userId?: string) => ipcRenderer.invoke('store:getSettings', userId),

});
