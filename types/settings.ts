export interface SettingsDTO {
    id: number;
    pomodoroDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
    notificationsEnabled: boolean;
    autoStartNext: boolean;
}
