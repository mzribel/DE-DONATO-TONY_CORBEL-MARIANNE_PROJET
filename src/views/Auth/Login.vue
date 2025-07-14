<script setup lang="ts">
import { ref, inject, Ref } from 'vue';
import { router } from '../../router';
// Services
import * as authService from '../../services/supabase/authService';
import { AuthState } from '../../types/auth';
// Components
import AuthForm from '../../components/AuthForm.vue';
// PrimeVue
import InputText from 'primevue/inputtext';

const authState = inject('authState') as Ref<AuthState>;

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  errorMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password';
    return;
  }

  isLoading.value = true;

  try {
    const data = await authService.signInWithEmail(email.value, password.value);

    authState.value.session = data.session;
    authState.value.user = {
      id: data.user.id,
      email: data.user.email ?? '',
      created_at: (data.user as any).created_at ?? '',
    };

    await router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message ?? 'Login failed';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <AuthForm
    title="Login"
    :onSubmit="handleSubmit"
    :errorMessage="errorMessage"
    :isLoading="isLoading"
    submitLabel="Login"
    alternateText="Don't have an account?"
    alternateLink="/signup"
  >
    <div class="form-element vertical">
      <label for="email">Email</label>
      <InputText id="email" v-model="email" type="email" required />
    </div>
    <div class="form-element vertical">
      <label for="password">Password</label>
      <InputText id="password" v-model="password" type="password" required />
    </div>
  </AuthForm>
</template>
