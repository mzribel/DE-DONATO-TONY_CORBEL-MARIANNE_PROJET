import {ref, computed, onBeforeUnmount, Ref, ComputedRef} from 'vue';
import { sessionsService } from '../services/supabase/newSessionService';
import { Session, SessionPart } from '../types/sessions';

export function useSessionRunner(userId: Ref<string> | ComputedRef<string>) {
    const currentSession = ref<Session | null>(null);
    const currentPart = ref<SessionPart | null>(null);
    const remainingTime = ref<number>(0);
    const isPaused = ref(false);
    const isLoading = ref(true);
    const currentPauseId = ref<string|null>(null);
    const isTimerRunning = ref<boolean>(false);

    let timerId: ReturnType<typeof setInterval> | null = null;
    let heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;

    async function loadCurrentSession() {
        isLoading.value = true;
        const { data: session } = await sessionsService.getCurrentSession(userId.value);
        if (!session) {
            currentSession.value = null;
            currentPart.value = null;
            isLoading.value = false;
            return;
        }
        currentSession.value = session;

        const { data: part } = await sessionsService.getCurrentSessionPart(session.id);
        if (part) {
            currentPart.value = part;
            remainingTime.value = part.remaining_time != null ?
                part.remaining_time : part.duration;

            isPaused.value = part.is_paused ?? false;
        } else {
            currentPart.value = null;
        }

        isLoading.value = false;

        if (currentSession.value.auto_start) {
            startTimer();
        }
    }

    async function tick() {
        const remainingMs = targetEndTime - Date.now();
        const seconds = Math.max(Math.ceil(remainingMs / 1000), 0);
        remainingTime.value = seconds;

        if (seconds <= 0) {
            stopTimer();
            await completeCurrentPart();
        }
    }

    let targetEndTime: number;
    async function sendHeartbeat() {
        if (!currentPart.value) return;
        await sessionsService.updateRemainingTime(currentPart.value.id, remainingTime.value, isPaused.value);
    }

    async function startTimer() {
        if (timerId || isPaused.value || !currentPart.value) return;
        targetEndTime = Date.now() + remainingTime.value * 1000;
        timerId = setInterval(tick, 1000);

        isTimerRunning.value = true;

        if (!currentPart.value.started_at) {
            currentPart.value.started_at = new Date().toISOString();
            sessionsService.startPart(currentPart.value.id, currentPart.value.started_at).then();
        }

        if (!heartbeatIntervalId) {
            heartbeatIntervalId = setInterval(sendHeartbeat, 5000);
        }
    }

    async function pauseTimer() {
        if (!timerId || !currentPart.value) return;
        clearInterval(timerId);
        timerId = null;
        isPaused.value = true;

        // Crée la pause en base
        const { data: pause, error } = await sessionsService.startPause(currentPart.value.id);
        if (error) {
            console.error('Erreur création pause', error);
        } else {
            currentPauseId.value = pause.id;
        }

        await sessionsService.updateRemainingTime(currentPart.value.id, remainingTime.value, true);
    }

    async function resumeTimer() {
        if (timerId || !currentPart.value || !isPaused.value) return;
        isPaused.value = false;

        // Termine la pause en base
        if (currentPauseId) {
            const { error } = await sessionsService.endPause(currentPauseId.value);
            if (error) {
                console.error('Erreur clôture pause', error);
            }
            currentPauseId.value = null;
        }

        targetEndTime = Date.now() + remainingTime.value * 1000;

        await sessionsService.updateRemainingTime(currentPart.value.id, remainingTime.value, false);
        timerId = setInterval(tick, 1000);
    }

    function stopTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        if (heartbeatIntervalId) {
            clearInterval(heartbeatIntervalId);
            heartbeatIntervalId = null;
        }
        isTimerRunning.value = false;
    }

    async function completeCurrentPart() {
        if (!currentPart.value) return;
        await sessionsService.completeSessionPart(currentPart.value.id);
        if (currentPauseId) {
            await sessionsService.endPause(currentPauseId.value);
            currentPauseId.value = null;
        }
        await createNextSessionPart();
    }

    async function skipCurrentPart() {
        console.log("?")
        if (!currentPart.value) return;
        stopTimer();
        if (currentPauseId) {
            await sessionsService.endPause(currentPauseId.value);
            currentPauseId.value = null;
        }
        console.log(remainingTime.value);
        await sessionsService.skipSessionPart(currentPart.value.id, remainingTime.value);
        await createNextSessionPart();
    }

    async function cancelCurrentSession() {
        if (!currentSession.value) return;
        stopTimer();
        await sessionsService.cancelSession(currentSession.value.id);
        if (currentPauseId) {
            await sessionsService.endPause(currentPauseId.value);
            currentPauseId.value = null;
        }
        currentSession.value = null;
        currentPart.value = null;
        if (heartbeatIntervalId) {
            clearInterval(heartbeatIntervalId);
            heartbeatIntervalId = null;
        }
    }

    async function saveBeforeUnload() {
        if (currentPart.value && !isPaused.value) {
            await sessionsService.updateRemainingTime(currentPart.value.id, remainingTime.value, false);
        }
    }

    window.addEventListener('beforeunload', saveBeforeUnload);
    // onBeforeUnmount(() => {
    //     stopTimer();
    //     window.removeEventListener('beforeunload', saveBeforeUnload);
    // });

    const progress = computed(() => {
        if (!currentPart.value) return 0;
        return (
            100 -
            Math.floor(((remainingTime.value ?? 0) / currentPart.value.duration) * 100)
        );
    });

    function stop() {
        // Arrête les timers actifs
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        if (heartbeatIntervalId) {
            clearInterval(heartbeatIntervalId);
            heartbeatIntervalId = null;
        }

        // Retire les écouteurs
        window.removeEventListener('beforeunload', saveBeforeUnload);

        // Réinitialise les données
        currentSession.value = null;
        currentPart.value = null;
        currentPauseId.value = null;
        remainingTime.value = 0;
        isPaused.value = false;
        isTimerRunning.value = false;
        isLoading.value = false;
    }

    async function createNextSessionPart() {
        if (!currentSession.value) return;

        // Récupère les pomodoros terminés
        const { data: parts, error } = await sessionsService.getAllSessionParts(currentSession.value.id);
        if (error || !parts) {
            console.error('Erreur récupération parts pour déterminer la suite', error);
            return;
        }

        const completedPomodoros = parts.filter(
            p => p.type === 'pomodoro' && (p.is_completed || p.is_skipped)
        ).length;

        const lastPart = parts[parts.length - 1];

        let nextType: 'pomodoro' | 'short_break' | 'long_break';
        let duration: number;

        if (!lastPart || lastPart.type === 'short_break' || lastPart.type === 'long_break') {
            // Après une pause, crée un pomodoro si cycles restants
            if (completedPomodoros < currentSession.value.total_cycles) {
                nextType = 'pomodoro';
                duration = currentSession.value.pomodoro_duration;
            } else {
                // Session terminée
                await sessionsService.completeSession(currentSession.value.id);
                currentSession.value = null;
                currentPart.value = null;
                return;
            }
        } else if (lastPart.type === 'pomodoro') {
            // Après un pomodoro, décide entre short_break et long_break
            if ((completedPomodoros % currentSession.value.cycles_before_long_break) === 0) {
                nextType = 'long_break';
                duration = currentSession.value.long_break_duration;
            } else {
                nextType = 'short_break';
                duration = currentSession.value.short_break_duration;
            }
        } else {
            console.error('Type de dernière partie inattendu:', lastPart.type);
            return;
        }

        // Crée dynamiquement la partie suivante
        const { error: createError } = await sessionsService.createSessionPart(currentSession.value.id, {
            type: nextType,
            duration,
        });

        if (createError) {
            console.error('Erreur création de la part suivante', createError);
        }

        // Charge la nouvelle partie
        await loadCurrentSession();
    }

    return {
        currentSession,
        currentPart,
        remainingTime,
        isPaused,
        isLoading,
        isTimerRunning,
        progress,
        startTimer,
        pauseTimer,
        resumeTimer,
        skipCurrentPart,
        cancelCurrentSession,
        loadCurrentSession,
        stop
    };
}
