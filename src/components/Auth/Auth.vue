<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AuthState } from '../../types';
import { authService } from '../../services/supabaseService';
import Login from './Login.vue';
import Signup from './Signup.vue';
import Profile from './Profile.vue';

const props = defineProps<{
  activeTab: 'login' | 'signup' | 'profile'
}>();

const emit = defineEmits<{
  (e: 'change-tab', tab: 'timer' | 'history' | 'settings' | 'login' | 'signup' | 'profile'): void
}>();

const authState = ref<AuthState>({
  user: null,
  session: null,
  loading: true
});

const checkUser = async () => {
  authState.value.loading = true;

  try {
    const { data, error } = await authService.getSession();

    if (error) {
      throw error;
    }

    if (data?.session) {
      authState.value.session = data.session;
      authState.value.user = data.session.user
        ? {
          id: data.session.user.id,
          email: typeof data.session.user.email === 'string' ? data.session.user.email : '',
          created_at: (data.session.user as any).created_at ?? ''
        }
        : null;

      if (props.activeTab === 'login' || props.activeTab === 'signup') {
        emit('change-tab', 'profile');
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
  } finally {
    authState.value.loading = false;
  }
};

const handleLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await authService.signIn(email, password);

    if (error) throw error;

    authState.value.session = data.session;
    authState.value.user = data.user
        ? {
          id: data.user.id,
          email: typeof data.user.email === 'string' ? data.user.email : '',
          created_at: (data.user as any).created_at ?? ''
        }
        : null;
    emit('change-tab', 'timer');
  } catch (error) {
    console.error('Error logging in:', error);
    return { error };
  }
};

const handleSignup = async (email: string, password: string) => {
  try {
    const { data, error } = await authService.signUp(email, password);

    if (error) throw error;

    if (data.user && !data.session) {
      return { message: 'No session returned' };
    }

    authState.value.session = data.session;
    authState.value.user = data.user
        ? {
          id: data.user.id,
          email: typeof data.user.email === 'string' ? data.user.email : '',
          created_at: (data.user as any).created_at ?? ''
        }
        : null;

    emit('change-tab', 'timer');
  } catch (error) {
    console.error('Error signing up:', error);
    return { error };
  }
};

// Handle logout
const handleLogout = async () => {
  try {
    const { error } = await authService.signOut();
    if (error) throw error;

    authState.value.user = null;
    authState.value.session = null;
    emit('change-tab', 'login');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

checkUser();

authService.onAuthStateChange((event, session) => {
  authState.value.session = session;
  authState.value.user = session?.user || null;
});

const isAuthenticated = computed(() => !!authState.value.user);
</script>

<template>
  <div class="auth-container">
    <div v-if="authState.loading" class="loading">
      Loading...
    </div>

    <template v-else>
      <Login 
        v-if="activeTab === 'login' && !isAuthenticated" 
        @login="handleLogin" 
        @go-to-signup="emit('change-tab', 'signup')" 
      />

      <Signup 
        v-else-if="activeTab === 'signup' && !isAuthenticated" 
        @signup="handleSignup" 
        @go-to-login="emit('change-tab', 'login')" 
      />

      <Profile 
        v-else-if="activeTab === 'profile' || isAuthenticated" 
        :user="authState.user" 
        @logout="handleLogout" 
      />
    </template>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: #666;
}
</style>
