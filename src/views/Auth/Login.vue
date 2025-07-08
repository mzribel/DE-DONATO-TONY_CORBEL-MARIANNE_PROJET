<script setup lang="ts">
import { ref } from 'vue';
import * as authService from '../../services/supabase/authService';
import Panel from "primevue/panel"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import {useRouter} from "vue-router";

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authService.signInWithEmail(email.value, password.value);
    await router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred';
  } finally {
    isLoading.value = false;
  }
};

const handleLogin = async (email: string, password: string) => {
  try {
    const data = await authService.signInWithEmail(email, password);

    authState.value.session = data.session;
    authState.value.user = data.user
      ? {
        id: data.user.id,
        email: typeof data.user.email === 'string' ? data.user.email : '',
        created_at: (data.user as any).created_at ?? ''
      }
      : null;
    await router.push("/")
  } catch (error) {
    console.error('Error logging in:', error);
    return { error };
  }
};
</script>

<template>
  <Panel class="auth-form">
    <template #header>
      <h1>Login</h1>
    </template>

    <form class="flex col row-gap-24" @submit.prevent="handleSubmit">
      <div class="form-group flex col row-gap-8">
        <div class="form-element vertical">
          <label for="email">Email</label>
          <InputText
            id="email"
            type="email"
            v-model="email"
            placeholder="Enter your email"
            required/>
        </div>
        <div class="form-element vertical">
          <label for="password">Password</label>
          <InputText
            id="password"
            type="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <Button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </Button>

    </form>
    <div class="auth-link">
      <router-link to="/signup">Don't have an account?</router-link>
    </div>
  </Panel>
</template>

<style scoped>
.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
