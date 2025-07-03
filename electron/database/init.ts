import { Settings } from './entities/Settings';
import { DEFAULT_SETTINGS } from '../../config/default';
import type { DataSource } from "typeorm";

export async function initSettings(datasource: DataSource) {
    const settingsRepo = datasource.getRepository(Settings);

    const count = await settingsRepo.count();
    if (!count) {
        const defautSettings = settingsRepo.create({
            pomodoroDuration: DEFAULT_SETTINGS.pomodoroDuration,
            shortBreakDuration: DEFAULT_SETTINGS.shortBreakDuration,
            longBreakDuration: DEFAULT_SETTINGS.longBreakDuration,
            cyclesBeforeLongBreak: DEFAULT_SETTINGS.cyclesBeforeLongBreak,
            autoStartNext: DEFAULT_SETTINGS.autoStartNext,
            notificationsEnabled: DEFAULT_SETTINGS.notificationsEnabled,
        })
        await settingsRepo.save(defautSettings);
        console.log("Settings initialised with default values.")
    }
}