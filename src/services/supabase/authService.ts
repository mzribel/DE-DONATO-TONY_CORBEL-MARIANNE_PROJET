import { supabase } from './client';

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
    return data.session;
}

// export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
//     return supabase.auth.onAuthStateChange((event, session) => {
//         callback(event, session);
//     });
// }