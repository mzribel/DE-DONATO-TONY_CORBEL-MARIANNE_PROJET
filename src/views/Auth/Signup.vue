<script lang="ts" setup>
import { ref } from 'vue';
import * as authService from '../../services/supabase/authService';
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import Panel from "primevue/panel"
import {useRouter} from "vue-router";

const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters';
    return;
  }

  isLoading.value = true;

  try {
    const data = await authService.signUpWithEmail(email.value, password.value);

    if (data?.user && !data.session) {
      successMessage.value = 'Account created! Please check your email to confirm your address.';
      // Optionally redirect after delay:
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    if (data?.session) {
      await router.push('/');
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred';
  } finally {
    isLoading.value = false;
  }
};

const handleSignup = async (email: string, password: string) => {
  try {
    const data = await authService.signUpWithEmail(email, password);

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

    await router.push("/")
  } catch (error) {
    console.error('Error signing up:', error);
    return { error };
  }
};

</script>

<template>
  <Panel class="auth-form">
    <template #header>
      <h1>Create Account</h1>
    </template>

    <form class="flex col row-gap-24" @submit.prevent="handleSubmit">
      <div class="form-group flex col row-gap-8">
        <div class="form-element vertical">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            placeholder="Enter your email"
            required
            type="email"
          />
        </div>
        <div class="form-element vertical">
          <label for="password">Password</label>
          <InputText
            id="password"
            v-model="password"
            placeholder="Create a password"
            required
            type="password"
          />
        </div>
        <div class="form-element vertical">
          <label for="confirm-password">Confirm Password</label>
          <InputText
            id="confirm-password"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            required
            type="password"
          />
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <Button :disabled="isLoading" type="submit">
        {{ isLoading ? 'Creating account...' : 'Sign Up' }}
      </Button>
    </form>

    <div class="auth-link">
      <router-link to="/login">Already have an account?</router-link>
    </div>
  </Panel>
</template>

<style>
.auth-form .p-panel-content {
  display: flex;
  flex-direction: column;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #2ecc71;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
