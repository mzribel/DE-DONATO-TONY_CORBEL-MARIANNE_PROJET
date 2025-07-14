import { User } from "./users";
import type { AuthSession } from '@supabase/supabase-js'

export type AuthState = {
    user: User | null;
    authSession: AuthSession | null;
    loading: boolean;
}