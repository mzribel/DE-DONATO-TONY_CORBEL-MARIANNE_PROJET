import { AppDataSource } from "../database";
import { Settings } from "../database/entities/Settings";
import type {SettingsDTO} from "../../types/settings.ts";

// Récupérer ou créer les settings
export async function getSettings():Promise<SettingsDTO> {
    const repo = AppDataSource.getRepository(Settings);
    let settings = await repo.findOne({ where: {} });
    if (!settings) {
        settings = repo.create(); // valeurs par défaut
        await repo.save(settings);
    }
    return settings.toDto();
}

// Mettre à jour les settings
export async function updateSettings(newSettings:Partial<SettingsDTO>): Promise<SettingsDTO> {
    const repo = AppDataSource.getRepository(Settings);
    let settings = await repo.findOne({ where: {} });
    if (!settings) {
        settings = repo.create();
    }
    Object.assign(settings, newSettings);
    return (await repo.save(settings)).toDto();
}

// Réinitialiser les settings aux valeurs par défaut
export async function resetSettings(): Promise<SettingsDTO> {
    const repo = AppDataSource.getRepository(Settings);
    await repo.clear();
    const settings = repo.create(); // valeurs par défaut
    return (await repo.save(settings)).toDto();
}