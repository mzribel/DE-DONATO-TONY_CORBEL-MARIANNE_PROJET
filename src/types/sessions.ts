// Types de step autorisés
export type SessionPartType = 'pomodoro' | 'short_break' | 'long_break';

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
    started_at: string | null; // ISO timestamp ou null si pas encore démarré
    ended_at: string | null;   // ISO timestamp ou null si pas terminé
    is_completed: boolean;
    is_skipped: boolean;
    remaining_time: number | null; // en secondes, null si pas de sauvegarde
    is_paused: boolean | null;     // null si jamais mis en pause
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp
}

/**
 * Pause manuelle sur un part (session_part_pauses table)
 */
export interface SessionPartPause {
    id: string;
    session_part_id: string;
    started_at: string;           // ISO timestamp
    ended_at: string | null;      // ISO timestamp ou null si en cours
    created_at: string;           // ISO timestamp
    updated_at: string;           // ISO timestamp
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
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
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
    started_at: string | null; // ISO timestamp ou null si pas encore démarré
    ended_at: string | null;   // ISO timestamp ou null si pas terminé
    is_completed: boolean;
    is_skipped: boolean;
    remaining_time: number | null; // en secondes, null si pas de sauvegarde
    is_paused: boolean | null;     // null si jamais mis en pause
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp
}

/**
 * Pause manuelle sur un part (session_part_pauses table)
 */
export interface SessionPartPause {
    id: string;
    session_part_id: string;
    started_at: string;           // ISO timestamp
    ended_at: string | null;      // ISO timestamp ou null si en cours
    updated_at: string;           // ISO timestamp
}

import { useSessionRunner } from '../composables/useSessionRunner';
export type SessionRunner = ReturnType<typeof useSessionRunner>;