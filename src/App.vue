<script setup lang="ts">
import { provide, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useAuth } from './composables/useAuth';
import { useSettings } from './composables/useSettings';
import { useSessionRunner } from './composables/useSessionRunner';

import Button from "primevue/button"
import Avatar from "primevue/avatar"

const router = useRouter();

// Auth
const { authState, isAuthenticated, userId, init: initAuth } = useAuth();
provide('authState', authState);
provide('userId', userId);

// Settings (uniquement les données)
const settingsModule = useSettings();
provide('settings', settingsModule.settings);

// SessionRunner
const sessionRunner = ref<ReturnType<typeof useSessionRunner> | null>(null);
provide('sessionRunner', sessionRunner);

// Initialisation
onMounted(async () => {
  await initAuth(); // récupère la session Supabase (si existante)

  if (isAuthenticated.value) {
    await settingsModule.loadSettings();

    sessionRunner.value = useSessionRunner(userId);
    await sessionRunner.value.loadCurrentSession();
  }
});

// Reset le sessionRunner si déconnexion
watch(userId, async (id) => {
  if (!id) {
    sessionRunner.value?.stop();
    sessionRunner.value = null;
  } else {
    // Reconnexion => recharger session
    await settingsModule.loadSettings();
    sessionRunner.value = useSessionRunner(userId);
    await sessionRunner.value.loadCurrentSession();
  }
});
</script>

<template>
  <header>
    <nav v-if="isAuthenticated" class="flex justify-between">
      <div class="flex items-center flex-1">
        <RouterLink to="/">
          <div class="nav-tab">Pomodoro</div>
        </RouterLink>
        <RouterLink to="/history">
          <div class="nav-tab">History</div>
        </RouterLink>
      </div>
      <div class="flex align-center col-gap-16">
        <RouterLink tag="div" to="/settings">
          <Button icon="pi pi-cog" rounded aria-label="Filter" size="small" severity="secondary" variant="outlined"/>

        </RouterLink>
        <RouterLink to="/profile">
          <Avatar image="img/avatar.png" style="border-radius: 4px;"/>
        </RouterLink>
      </div>
    </nav>
    <nav v-else class="flex justify-end">
      <RouterLink tag="div" to="/login">
        <div class="nav-tab">Login</div>
      </RouterLink>
      <RouterLink to="/signup">
        <div class="nav-tab">Sign-up</div>
      </RouterLink>
    </nav>
  </header>
  <div id="content" class="flex col flex-1">
    <RouterView></RouterView>
  </div>
</template>

<style>
#app {
  flex:1;
  overflow-x: hidden;
}
nav {
  padding: 1rem;
  display: flex;
  gap: 1rem;
}

#content {
  padding: 70px 20px 20px;
  min-height: 100%;
  width: 100%;
}

header {
  position: fixed;
  width: 100%;
  border-bottom: var(--p-panel-header-border-color) solid 1px;
  height: 50px;
  z-index: 10;
  background-color: white;
}
nav {
  padding: 0 20px;
}
.nav-tab {
  color: var(--p-panel-color);
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  position: relative;
}

a.router-link-active .nav-tab::after {
  position: absolute;
  content: "";
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: var(--p-button-primary-border-color);
}
</style>
