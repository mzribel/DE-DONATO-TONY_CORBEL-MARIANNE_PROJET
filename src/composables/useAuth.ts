import { ref, computed } from 'vue';
import { getSession, onAuthStateChange } from '../services/supabase/authService';
import type { AuthSession as SupabaseAuthSession, User as SupabaseUser } from '@supabase/supabase-js';

type UserAuth = {
    id: string;
    email: string;
    created_at: string;
};

type AuthState = {
    user: UserAuth | null;
    session: SupabaseAuthSession | null;
    loading: boolean;
};

const authState = ref<AuthState>({
    user: null,
    session: null,
    loading: true
});

const isAuthenticated = computed(() => !!authState.value.user);
const userId = computed(() => authState.value.user?.id ?? '');

async function init() {
    authState.value.loading = true;

    const { session } = await getSession();

    authState.value.session = session;
    authState.value.user = session?.user ? mapUser(session.user) : null;

    authState.value.loading = false;
}

function mapUser(user: SupabaseUser): UserAuth {
    return {
        id: user.id,
        email: user.email ?? '',
        created_at: user.created_at ?? ''
    };
}

// Écouteur global d’état Supabase
onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
        authState.value = { user: null, session: null, loading: false };
    } else if (session?.user) {
        authState.value.session = session;
        authState.value.user = mapUser(session.user);
    }
});

export function useAuth() {
    return {
        authState,
        isAuthenticated,
        userId,
        init
    };
}
