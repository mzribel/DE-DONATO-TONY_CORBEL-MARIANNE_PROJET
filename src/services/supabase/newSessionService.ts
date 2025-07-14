// services/sessions.service.ts
import { supabase } from './client';
import { Session, SessionPart, SessionPartPause, CreateSessionInput, CreateSessionPartInput } from '../../types/sessions';

export const sessionsService = {
    async createSession(params: CreateSessionInput) {
        const { data, error } = await supabase
            .from('sessions')
            .insert([params])
            .select()
            .single();
        return { data: data as Session, error };
    },

    async createSessionPart(sessionId: string, part: CreateSessionPartInput) {
        const { data, error } = await supabase
            .from('session_parts')
            .insert({
                session_id: sessionId,
                type: part.type,
                duration: part.duration,
                remaining_time: part.duration
            })
            .select()
            .single();

        return { data: data as SessionPart, error };
    },

    async getCurrentSession(userId: string) {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_running', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return { data: data ?? null as Session, error };
    },

    async getCurrentSessionPart(sessionId: string) {
        const { data, error } = await supabase
            .from('session_parts')
            .select('*')
            .eq('session_id', sessionId)
            .eq('is_completed', false)
            .eq('is_skipped', false)
            .order('order', { ascending: true })
            .limit(1)
            .single();
        return { data: data as SessionPart, error };
    },

    async getAllSessionParts(sessionId: string) {
        const { data, error } = await supabase
            .from('session_parts')
            .select('*')
            .eq('session_id', sessionId)
            .order('order', { ascending: true });

        if (error) {
            console.error('Erreur récupération session_parts:', error);
            return { data: null, error };
        }
        return { data: data as SessionPart[], error: null };
    },

    async completeSessionPart(partId: string) {
        const { data, error } = await supabase
            .from('session_parts')
            .update({
                is_completed: true,
                remaining_time:0,
                ended_at: new Date().toISOString(),
            })
            .eq('id', partId)
            .select()
            .single();

        return { data: data as SessionPart, error };
    },

    async skipSessionPart(partId: string, remaining_time:number) {
        const { data, error } = await supabase
            .from('session_parts')
            .update({
                is_skipped: true,
                remaining_time: remaining_time,
                ended_at: new Date().toISOString(),
            })
            .eq('id', partId)
            .select()
            .single();

        return { data: data as SessionPart, error };
    },

    async updateRemainingTime(partId: string, remainingTime: number, isPaused: boolean) {
        const { data, error } = await supabase
            .from('session_parts')
            .update({
                remaining_time: remainingTime,
                is_paused: isPaused,
                updated_at: new Date().toISOString(),
            })
            .eq('id', partId)
            .select()
            .single();

        return { data: data as SessionPart, error };
    },

    async startPause(partId: string) {
        const { data, error } = await supabase
            .from('session_part_pauses')
            .insert([
                {
                    session_part_id: partId,
                    started_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        return { data: data as SessionPartPause, error };
    },

    async startPart(partId: string, startedAt:string) {
        const { data, error } = await supabase
            .from('session_parts')
            .update([
                {
                    started_at: startedAt,
                },
            ])
            .eq('id', partId)
            .select()
            .single();

        return { data: data as SessionPart, error };
    },

    async endPause(pauseId: string) {
        const { data, error } = await supabase
            .from('session_part_pauses')
            .update({
                ended_at: new Date().toISOString(),
            })
            .eq('id', pauseId)
            .select()
            .single();

        return { data: data as SessionPartPause, error };
    },

    async completeSession(sessionId: string) {
        const { data, error } = await supabase
            .from('sessions')
            .update({
                is_running: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId)
            .select()
            .single();

        return { data: data as Session, error };
    },

    async deleteSession(sessionId: string) {
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionId);

        return { error };
    },

    async cancelSession(sessionId: string) {
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .update({
                is_running: false,
            })
            .eq('id', sessionId)
            .select()
            .single();

        const { data: partsData, error: partsError } = await supabase
            .from('session_parts')
            .update({
                is_skipped: true,
                ended_at: new Date().toISOString(),
            })
            .eq('session_id', sessionId)
            .eq('is_completed', false)
            .eq('is_skipped', false)
            .select();

        return {
            session: sessionData as Session,
            sessionError,
            parts: partsData as SessionPart[],
            partsError,
        };
    },

};
