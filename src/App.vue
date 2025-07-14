<script setup lang="ts">
import { provide } from 'vue';
// Services
import { useAuth } from './composables/useAuth';
// PrimeVue
import Avatar from "primevue/avatar";
import Button from "primevue/button"

// Authentification
const { authState, isAuthenticated, userId, sessionRunner } = useAuth();
// useAuth().setupRecoveryListener();

// Variables globales
provide('authState', authState);
provide('userId', userId);
provide('sessionRunner', sessionRunner);

console.log(authState, userId)
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
