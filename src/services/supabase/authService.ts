import { supabase } from './client';
import { AuthApiError } from '@supabase/supabase-js';

import type {
    User as SupabaseUser,
    Session as SupabaseSession,
    AuthChangeEvent
} from '@supabase/supabase-js';

export async function signInWithEmail(email: string, password: string): Promise<{ user: SupabaseUser; session: SupabaseSession }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (error instanceof AuthApiError) {
            console.log(error.message)

            if (error.status === 400) {
                throw new Error("Incorrect email or password.");
            } else if (error.status === 429) {
                throw new Error("Too many login attempts. Please try again later.");
            } else {
                throw new Error(error.message); // fallback message
            }
        } else {
            throw new Error("Unexpected authentication error.");
        }
    }

    if (!data.user || !data.session) {
        throw new Error("Login failed: incomplete response from Supabase.");
    }

    return data;
}

export async function signUpWithEmail(email: string, password: string): Promise<{ user: SupabaseUser; session: SupabaseSession }> {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        if (error instanceof AuthApiError) {
            if (error.status === 400) {
                throw new Error("Invalid email or password format.");
            } else if (error.status === 422) {
                throw new Error("User already registered.");
            } else if (error.status === 429) {
                throw new Error("Too many requests. Please try again later.");
            } else {
                throw new Error(error.message); // fallback
            }
        } else {
            throw new Error("Unexpected authentication error.");
        }
    }

    if (!data.user || !data.session) {
        throw new Error("Signup failed: incomplete response from Supabase.");
    }

    return data;
}

export async function signOut():Promise<void> {
    const { error } = await supabase.auth.signOut();

    // Suffering
    // const response = await fetch('https://id.supabase.co/auth/v1/logout', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${accessToken}`, // récupéré depuis la session
    //         'apikey': '...',
    //     },
    // });
    //
    // if (!response.ok) {
    //     console.error(`Logout failed: ${response.status}`, await response.text());
    // } else {
    //     console.log('Successfully logged out');
    // }

    if (error) console.error(error);
}

export async function getSession():Promise<{session: SupabaseSession }> {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error(error);
    return data;
}

export function onAuthStateChange(callback: (event: string, session: SupabaseSession ) => void) {
    return supabase.auth.onAuthStateChange((event:AuthChangeEvent, session:SupabaseSession) => {
        callback(event, session);
    });
}

// TODO : Corriger le retour et les types
export async function resetPassword(email:string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'pomodoro://auth-callback',
    })
    if (error) console.error(error);
    return data;
}

// TODO : Corriger le retour et les types
export const updatePassword = async (newPassword: string) => {
    return await supabase.auth.updateUser({ password: newPassword });
};