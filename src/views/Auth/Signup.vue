<script setup lang="ts">
import { ref, inject, Ref } from 'vue';
import { router } from '../../router';
// Services
import * as authService from '../../services/supabase/authService';
import { validatePasswordFields } from '../../utils/passwordValidation';
import { AuthState } from '../../types/auth';
// Components
import AuthForm from '../../components/AuthForm.vue';
// PrimeVue
import InputText from 'primevue/inputtext';

const authState = inject('authState') as Ref<AuthState>;

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  const validationError = validatePasswordFields(password.value, confirmPassword.value);
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  isLoading.value = true;

  try {
    const data = await authService.signUpWithEmail(email.value, password.value);

    if (data.user && !data.session) {
      successMessage.value = 'Account created! Please check your email.';
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    authState.value.authSession = data.session;
    authState.value.user = {
      id: data.user.id,
      email: data.user.email ?? '',
      created_at: (data.user as any).created_at ?? '',
    };

    await router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message ?? 'Signup failed';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <AuthForm
    title="Create Account"
    :onSubmit="handleSubmit"
    :errorMessage="errorMessage"
    :successMessage="successMessage"
    :isLoading="isLoading"
    submitLabel="Sign Up"
    loadingLabel="Creating account..."
    alternateText="Already have an account?"
    alternateLink="/login"
  >
    <div class="form-element vertical">
      <label for="email">Email</label>
      <InputText id="email" v-model="email" type="email" required />
    </div>
    <div class="form-element vertical">
      <label for="password">Password</label>
      <InputText id="password" v-model="password" type="password" required />
    </div>
    <div class="form-element vertical">
      <label for="confirmPassword">Confirm Password</label>
      <InputText id="confirmPassword" v-model="confirmPassword" type="password" required />
    </div>
  </AuthForm>
</template>
