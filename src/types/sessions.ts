// Types de step autorisés
export type SessionPartType = 'pomodoro' | 'short_break' | 'long_break';
export const SESSION_PART_LABELS: Record<SessionPartType, string> = {
    pomodoro: 'Pomodoro',
    short_break: 'Pause courte',
    long_break: 'Pause longue',
};

// Structure d'une session part à créer
export interface CreateSessionPartInput {
    type: SessionPartType;
    duration: number;
}

// Structure pour créer une session
export interface CreateSessionInput {
    user_id: string;
    pomodoro_duration: number;
    short_break_duration: number;
    long_break_duration: number;
    cycles_before_long_break: number;
    total_cycles: number;
    auto_repeat: boolean;
    auto_start: boolean;
}

/**
 * Partie de session (session_parts table)
 */
export interface SessionPart {
    id: string;
    session_id: string;
    type: SessionPartType;
    duration: number; // en secondes
    order: number;
    started_at: string | null;
    ended_at: string | null;
    is_completed: boolean;
    is_skipped: boolean;
    remaining_time: number | null;
    is_paused: boolean | null;
    created_at: string;
    updated_at: string;
}

/**
 * Pause manuelle sur un part (session_part_pauses table)
 */
export interface SessionPartPause {
    id: string;
    session_part_id: string;
    started_at: string;
    ended_at: string | null;
    created_at: string;
    updated_at: string;
}
/**
 * Session complète (sessions table)
 */
export interface Session {
    id: string;
    user_id: string;
    pomodoro_duration: number;
    short_break_duration: number;
    long_break_duration: number;
    cycles_before_long_break: number;
    total_cycles: number;
    auto_repeat: boolean;
    auto_start: boolean;
    is_running: boolean;
    created_at: string;
    updated_at: string;
}

import { useSessionRunner } from '../composables/useSessionRunner';
export type SessionRunner = ReturnType<typeof useSessionRunner>;