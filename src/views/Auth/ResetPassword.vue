<script setup lang="ts">
import { ref } from 'vue';
import { router } from '../../router';
// Services
import * as authService from '../../services/supabase/authService';
import { validatePasswordFields } from '../../utils/passwordValidation';
// Components
import AuthForm from '../../components/AuthForm.vue';
// PrimeVue
import InputText from 'primevue/inputtext';

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
  const { error } = await authService.updatePassword(password.value);
  if (error) {
    errorMessage.value = error.message;
  } else {
    successMessage.value = 'Password updated!';
    setTimeout(() => router.push('/login'), 3000);
  }
  isLoading.value = false;
};
</script>

<template>
  <AuthForm
    title="Reset Password"
    :onSubmit="handleSubmit"
    :errorMessage="errorMessage"
    :successMessage="successMessage"
    :isLoading="isLoading"
    submitLabel="Reset Password"
    loadingLabel="Resetting..."
  >
    <div class="form-element vertical">
      <label for="password">New Password</label>
      <InputText id="password" v-model="password" type="password" required />
    </div>
    <div class="form-element vertical">
      <label for="confirmPassword">Confirm Password</label>
      <InputText id="confirmPassword" v-model="confirmPassword" type="password" required />
    </div>
  </AuthForm>
</template>
