import { supabase } from './client';
import type { Settings } from '../../types/settings';

export async function getSettings(userId: string): Promise<Settings | null> {
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle<Settings>();

    if (error) {
        console.error(error);
    }
    if (data == null) {
        console.log("No settings data : creating...")
        return createSettings(userId);
    }

    return data;
}

export async function updateSettings(newSettings: Partial<Settings>, userId: string): Promise<Settings | null> {
    const { data, error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error(error);
        return null;
    }

    return data as Settings;
}

async function createSettings(userId: string): Promise<Settings | null> {
    const { data: createdData, error: insertError } = await supabase
        .from('user_settings')
        .upsert({
            user_id: userId
        })
        .select('*')
        .single();

    if (insertError) {
        console.error("Erreur lors de la création des settings:", insertError);
        return null;
    }

    return createdData as Settings;
}

export async function resetSettings(userId: string): Promise<Settings | null> {
    // Supprimer la ligne existante
    const { error: deleteError } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId);

    if (deleteError) {
        console.error(deleteError);
        return null;
    }

    // La recréer
    return createSettings(userId);
}
