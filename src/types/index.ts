// Toutes mes structures de données

export type Tab = 'timer' | 'history' | 'settings' | 'login' | 'signup' | 'profile';

export type TimerType = 'pomodoro' | 'shortBreak' | 'longBreak';

export type Session = {
    id: number;
    type: string;
    duration: number;
    startTime: string;
    endTime: string;
    userId?: string;
}

export type User = {
    id: string;
    email: string;
    created_at: string;
}

export type AuthState = {
    user: User | null;
    session: any | null;
    loading: boolean;
}
