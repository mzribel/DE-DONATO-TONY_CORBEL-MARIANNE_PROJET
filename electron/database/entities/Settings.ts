import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import type {SettingsDTO} from "../../../types/settings.ts";

@Entity()
export class Settings {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int", default: 25, nullable: false, name:  "pomodoro_duration" })
    pomodoroDuration!: number;

    @Column({ type: "int", default: 5, nullable: false, name:  "short_break_duration" })
    shortBreakDuration!: number;

    @Column({ type: "int", default: 15, nullable: false, name:  "long_break_duration" })
    longBreakDuration!: number;

    @Column({ type: "int", default: 4, nullable: false, name:  "cycle_before_long_break" })
    cyclesBeforeLongBreak!: number;

    @Column({ type:"boolean", default: true, nullable: false, name:  "notifications_enabled" })
    notificationsEnabled!: boolean;

    @Column({ type:"boolean", default: false, nullable: false, name:  "auto_start_next" })
    autoStartNext!: boolean;

    toDto(): SettingsDTO {
        return {
            id: this.id,
            pomodoroDuration: this.pomodoroDuration,
            shortBreakDuration: this.shortBreakDuration,
            longBreakDuration: this.longBreakDuration,
            cyclesBeforeLongBreak: this.cyclesBeforeLongBreak,
            notificationsEnabled: this.notificationsEnabled,
            autoStartNext: this.autoStartNext,
        };
    }
}