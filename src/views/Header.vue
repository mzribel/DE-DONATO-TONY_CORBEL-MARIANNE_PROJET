<script setup lang="ts">
import { computed } from 'vue';
import type { Tab } from '../types/Tab';

const props = defineProps<{
  activeTab: Tab,
  isAuthenticated?: boolean
}>();

const emit = defineEmits<{
  (e: 'change-tab', tab: Tab): void
}>();

const changeTab = (tab: Tab) => {
  emit('change-tab', tab);
};

const isLoggedIn = computed(() => props.isAuthenticated);

// TODO : rajouter un "switch" pour passer de mode "coin de bureau" (un peu genre mobile, avec les plusieurs Tabs) à mode "desktop" (avec les 3 sections visibles en même temps)

</script>

<template>
  <nav class="header">
    <div class="nav-container">
      <div class="logo">
        <img src="/mariannepray.png" alt="Pomodoro App" class="logo-icon" />
        <span class="logo-text">Pomodoro</span>
      </div>

      <div class="nav-links">
        <button 
          :class="{ active: activeTab === 'timer' }" 
          @click="changeTab('timer')"
        >
          Timer
        </button>
        <button 
          :class="{ active: activeTab === 'history' }" 
          @click="changeTab('history')"
        >
          History
        </button>
        <button 
          :class="{ active: activeTab === 'settings' }" 
          @click="changeTab('settings')"
        >
          Settings
        </button>

        <!-- Auth navigation -->
        <div class="auth-buttons">
          <template v-if="isLoggedIn">
            <button 
              :class="{ active: activeTab === 'profile' }" 
              @click="changeTab('profile')"
            >
              Profile
            </button>
          </template>
          <template v-else>
            <button 
              :class="{ active: activeTab === 'login' }" 
              @click="changeTab('login')"
            >
              Login
            </button>
            <button 
              :class="{ active: activeTab === 'signup' }" 
              @click="changeTab('signup')"
            >
              Sign Up
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.header {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 2rem;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-links button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-links button.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding-left: 1rem;
}

@media (max-width: 600px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .auth-buttons {
    margin-left: 0;
    margin-top: 0.5rem;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 0.5rem;
    width: 100%;
    justify-content: center;
  }
}
</style>
