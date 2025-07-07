// composables/usePomodoroSessions.ts
import { ref, computed } from 'vue';
import { supabase } from '../services/supabase/client';
import type { Session } from '../types/sessions';

export function useSessions(userId?: string) {
    const sessions = ref<Session[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Fetch sessions depuis Supabase
     */
    const fetchSessions = async () => {
        loading.value = true;
        error.value = null;
        try {
            let query = supabase
                .from('sessions')
                .select(`
                    *,
                    session_parts(
                        *,
                        session_part_pauses(*)
                    )
                `)
                .order('created_at', {ascending: false});

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const {data, error: fetchError} = await query;
            if (fetchError) throw fetchError;
            sessions.value = data || [];
        } catch (err: any) {
            error.value = err.message || 'Erreur inconnue';
        } finally {
            loading.value = false;
        }
    };

    /**
     * STATISTIQUES
     */

        // Nombre total de sessions
    const totalSessions = computed(() => sessions.value.length);

    // Temps total productif (en minutes)
    const totalFocusMinutes = computed(() =>
        sessions.value.reduce((sum, session) => sum + session.pomodoro_duration, 0)
    );

    // Durée moyenne d'une session (en minutes)
    const averageSessionMinutes = computed(() =>
        totalSessions.value > 0 ? totalFocusMinutes.value / totalSessions.value : 0
    );

    // Sessions par jour
    const sessionsByDay = computed(() => {
        const map: Record<string, Session[]> = {};
        sessions.value.forEach(session => {
            const day = new Date(session.created_at).toISOString().split('T')[0];
            if (!map[day]) map[day] = [];
            map[day].push(session);
        });
        return map;
    });

    // Sessions filtrées sur la semaine courante (pour graph semaine)
    const currentWeekSessions = computed(() => {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // dimanche
        startOfWeek.setHours(0, 0, 0, 0);
        return sessions.value.filter(session => new Date(session.created_at) >= startOfWeek);
    });

    return {
        sessions,
        loading,
        error,
        fetchSessions,

        // statistiques
        totalSessions,
        totalFocusMinutes,
        averageSessionMinutes,
        sessionsByDay,
        currentWeekSessions,
    };
}
