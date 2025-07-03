<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSession, onAuthStateChange } from './services/supabase/authService';
const isAuthenticated = ref(false);

onMounted(async () => {
  const data = await getSession();
  isAuthenticated.value = !!data?.session;
});

onAuthStateChange((event, session) => {
  isAuthenticated.value = !!session;
});
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>

    <template v-if="isAuthenticated">
      <RouterLink to="/settings">Settings</RouterLink>
      <RouterLink to="/pomodoro">Pomodoro</RouterLink>
      <RouterLink to="/history">History</RouterLink>
      <RouterLink to="/profile">Profile</RouterLink>
    </template>
    <template v-else>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/signup">Signup</RouterLink>
    </template>
  </nav>
  <div id="content">
    <RouterView></RouterView>
  </div>
</template>

<style scoped>
nav {
  padding: 1rem;
  display: flex;
  gap: 1rem;
}

a {
  color: #4a6fa5;
  text-decoration: none;
  font-weight: 500;
}

a.router-link-active {
  color: #3a5a8c;
  font-weight: 700;
}
#content {
  padding: 20px;
}
</style>
