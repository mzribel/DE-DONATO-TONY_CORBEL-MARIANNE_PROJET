import { supabase } from '../services/supabase/client';
import { router } from "../router";
import { computed, onMounted, ref } from "vue";
import { AuthState } from "../types/auth";
import { useSessionRunner } from "./useSessionRunner";
import { getSession, onAuthStateChange } from "../services/supabase/authService";

export function useAuth() {
    const authState = ref<AuthState>({
        user: null,
        session: null,
        loading: true
    });

    const isAuthenticated = computed(() => !!authState.value.user);
    const userId = computed(() => authState.value.user?.id ?? '');

    const sessionRunner = useSessionRunner(userId);

    onMounted(async () => {
        authState.value.loading = true;

        const { session } = await getSession();
        authState.value.session = session ?? null;
        authState.value.user = session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
                created_at: session.user.created_at ?? ''
            }
            : null;

        authState.value.loading = false;

        if (session) await sessionRunner.loadCurrentSession();
    });

    onAuthStateChange((_, session) => {
        authState.value.session = session;
        authState.value.user = session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
                created_at: session.user.created_at ?? ''
            }
            : null;
    });

    function setupRecoveryListener() {
        (window as any).electronAPI?.onRecoveryToken(async ({ token, refreshToken }) => {
            const { error } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: refreshToken
            });

            if (error) {
                alert("Erreur lors de la récupération : " + error.message);
            } else {
                await router.push('/reset-password');
            }
        });

    }

    return {  authState, isAuthenticated, userId, sessionRunner, setupRecoveryListener };
}
