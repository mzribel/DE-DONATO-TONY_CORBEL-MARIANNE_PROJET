import { contextBridge, ipcRenderer } from 'electron';
import * as settingsService from "./services/supabase/settingsService"; // chemin correct car /electron/preload.ts
import * as authService from "./services/supabase/authService";
import type {SettingsDTO} from "../types/settings.ts";

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
    getSettings: (userId: string) => settingsService.getSettings(userId),
    updateSettings: (newSettings:Partial<SettingsDTO>) => settingsService.updateSettings(newSettings),
    resetSettings:(userId: string) => settingsService.resetSettings(userId),
    signIn: (email: string, password: string) => authService.signInWithEmail(email, password),
    getCurrentUser: () => authService.getCurrentUser(),

    // Database operations
    saveSession: (sessionData: any) => ipcRenderer.invoke('db:saveSession', sessionData),
    getSessions: (userId?: string) => ipcRenderer.invoke('db:getSessions', userId),
});
