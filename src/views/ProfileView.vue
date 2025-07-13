<script setup lang="ts">
import {computed, inject, Ref} from 'vue';
import {router} from '../router';
// Services
import * as authService from '../services/supabase/authService';
import {AuthState} from '../types/auth';
// PrimeVue
import Button from 'primevue/button';
import Fieldset from 'primevue/fieldset';
import InputText from 'primevue/inputtext';

// Variables globales
const authState = inject('authState') as Ref<AuthState>;
const userId = inject('userId') as Ref<string>;

const userEmail = computed(() => authState.value.user?.email ?? '');
const createdAt = computed(() => {
  const date = authState.value.user?.created_at;
  return date ? new Date(date).toLocaleDateString() : '';
});

const daysSinceCreation = computed(() => {
  const created = authState.value.user?.created_at;
  if (!created) return null;

  const createdDate = new Date(created);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});
const handleLogout = async () => {
  try {
    await authService.signOut();
    authState.value.user = null;
    authState.value.session = null;
    await router.push('/login');
  } catch (err) {
    console.error('Logout error:', err);
  }
};
const handleDeleteAccount = async () => {
  if (!confirm('This will permanently delete your account. Continue?')) return;

  try {
    const session = (await authService.getSession())?.session;
    const token = session?.access_token;

    if (!token) {
      alert("You're not logged in.");
      return;
    }

    const { _, error } = await (window as any).electronAPI.deleteAccount(token);
    if (error) {
      alert('Error deleting account: ' + error);
      return;
    }

    await handleLogout();
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('An unexpected error occurred.');
  }
};
const handleResetPassword = () => {
  if (!userEmail.value) return;
  authService.resetPassword(userEmail.value);
};

</script>

<template>
  <div class="flex align-center justify-between">
    <h1>Profile</h1>
    <Button label="Logout" @click="handleLogout" />
  </div>

  <div class="flex col row-gap-8">
    <Fieldset legend="Informations">
      <div class="flex col row-gap-16">
        <div class="form-element vertical">
          <label>User ID:</label>
          <InputText type="text" disabled :value="userId" />
        </div>
        <div class="form-element vertical">
          <label>Email:</label>
          <InputText type="text" disabled :value="userEmail" />
        </div>
        <div class="form-element vertical">
          <label>Account creation:</label>
          <span style="padding-left: 20px; font-weight: bold">{{ createdAt }} </span>
          <span v-if="daysSinceCreation">({{ daysSinceCreation }} day(s) ago)</span>
        </div>
      </div>
    </Fieldset>

    <Fieldset legend="Account administration">
      <div class="flex col row-gap-16">
        <div class="form-element vertical">
          <label>Reset password:</label>
          <Button disabled label="Send reset link" variant="outlined" severity="warn" @click="handleResetPassword" />
        </div>
        <div class="form-element vertical">
          <label>Delete account:</label>
          <Button label="Delete account" severity="danger" @click="handleDeleteAccount" />
        </div>
      </div>
    </Fieldset>
  </div>
</template>
