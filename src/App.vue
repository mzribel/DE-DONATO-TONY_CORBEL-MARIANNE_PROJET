<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import { getSession, onAuthStateChange } from './services/supabase/authService';
import { useSessionRunner } from './composables/useSessionRunner';
import Avatar from "primevue/avatar"
import Button from "primevue/button"
import * as authService from "./services/supabase/authService";
import {AuthState} from "./types/auth";
const isAuthenticated = ref(false);

const authState = ref(<AuthState>{
  user: null,
  session: null,
  loading: true
});
provide('authState', authState);

onMounted(async () => {
  authState.value.loading = true;
  const { session } = await getSession();

  if (session) {
    authState.value.session = session;
    authState.value.user = {
      id: session.user.id,
      email: session.user.email,
      created_at: session.user.created_at,
    };
  }
  authState.value.loading = false;

  isAuthenticated.value = !!session;
  await sessionRunner.loadCurrentSession();
});

authService.onAuthStateChange((event, session) => {
  authState.value.session = session;
  authState.value.user = session?.user
    ? {
      id: session.user.id,
      email: session.user.email,
      created_at: session.user.created_at ?? ''
    }
    : null;
});

onAuthStateChange((event, session) => {
  isAuthenticated.value = !!session;
});

const userId = '06a29c38-1879-49f8-a54c-db4b829a2b4c';
const sessionRunner = useSessionRunner(userId);

provide('sessionRunner', sessionRunner);
provide('userId', userId);

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
          <Avatar image="mariannepray.png" style="border-radius: 4px;"/>
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
