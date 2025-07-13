import { supabase } from './client';
import { AuthSession } from "@supabase/supabase-js";

export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) console.error(error);
    return data;
}

export async function signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    if (error) console.error(error);
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error);
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error(error);
    return data;
}

export function onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

export async function resetPassword(email:string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'pomodoro://auth-callback',
    })
    if (error) console.error(error);
    return data;
}

export const updatePassword = async (newPassword: string) => {
    return await supabase.auth.updateUser({ password: newPassword });
};