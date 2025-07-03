<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue';
import Header from './components/Header.vue';
import PomodoroTimer from './components/PomodoroTimer.vue';
import SessionHistory from './components/SessionHistory.vue';
import Settings from './components/Settings.vue';
import Auth from './components/Auth/Auth.vue';
import { authService } from './services/supabaseService';
import type { Tab, User, AuthState } from "./types";

const activeTab = ref<Tab>('timer');
const isLoading = ref(true);

// Create auth state that will be provided to child components
const authState = ref<AuthState>({
  user: null,
  session: null,
  loading: true
});

// Check if user is already logged in
const checkUser = async () => {
  authState.value.loading = true;
  isLoading.value = true;

  try {
    const { data, error } = await authService.getSession();

    if (error) {
      console.error('Error checking auth status:', error);
      return;
    }

    if (data?.session) {
      authState.value.session = data.session;
      authState.value.user = data.session.user as User;
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
  } finally {
    authState.value.loading = false;
    isLoading.value = false;
  }
};

// Set up auth state change listener
authService.onAuthStateChange((event, session) => {
  authState.value.session = session;
  authState.value.user = session?.user as User || null;
});

// Provide auth state to child components
provide('authState', authState);

onMounted(() => {
  checkUser();
});

const changeTab = (tab: Tab) => {
  activeTab.value = tab;
};

const isAuthenticated = computed(() => !!authState.value.user);
</script>

<template>
  <div class="app-container">
    <Header 
      :activeTab="activeTab" 
      :isAuthenticated="isAuthenticated" 
      @change-tab="changeTab" 
    />

    <main class="content">
      <div v-if="isLoading" class="loading-container">
        <p>Loading...</p>
      </div>
      <template v-else>
        <PomodoroTimer v-if="activeTab === 'timer'" />
        <SessionHistory v-else-if="activeTab === 'history'" />
        <Settings v-else-if="activeTab === 'settings'" />
        <Auth 
          v-else-if="['login', 'signup', 'profile'].includes(activeTab)" 
          :activeTab="activeTab as 'login' | 'signup' | 'profile'" 
          @change-tab="changeTab" 
        />
      </template>
    </main>

    <footer class="footer">
      <p>CORBEL Marianne & DE DONATO Tony &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

.footer {
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: #666;
  background-color: rgba(0, 0, 0, 0.05);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-style: italic;
  color: #666;
}
</style>
