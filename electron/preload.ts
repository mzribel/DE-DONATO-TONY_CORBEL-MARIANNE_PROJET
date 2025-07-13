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
    notify: (title: string, body: string) => ipcRenderer.invoke('notify', { title, body }),
    onRecoveryToken: (callback: (token: string) => void) => {
        ipcRenderer.on('recovery-token', (_event, token) => callback(token));
    },
    deleteAccount: (token: string) => ipcRenderer.invoke('delete-account', token),
});
