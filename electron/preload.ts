import { contextBridge, ipcRenderer } from 'electron';
import type {SettingsDTO} from "../types/settings.ts";
import * as settingsService from "./services/settingsService"; // chemin correct car /electron/preload.ts

// import * as settingsService from "./services/settingsService";
// import type {SettingsDTO} from "../types/settings.ts";
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
    getSettings: () => settingsService.getSettings(),
    updateSettings: (newSettings:Partial<SettingsDTO>) => settingsService.updateSettings(newSettings),
    resetSettings: () => settingsService.resetSettings(),
});
