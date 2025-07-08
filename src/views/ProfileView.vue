<script setup lang="ts">
import {computed, inject, Ref} from 'vue';
import type { User } from '../types/users';
import Button from "primevue/button"
import Fieldset from "primevue/fieldset"
import InputText from "primevue/inputtext"
import {router} from "../router";
import * as authService from "../services/supabase/authService";
// Récupération de l'authState
const authState = inject('authState') as Ref<{
  user: {
    id: string,
    email: string,
    created_at: string
  } | null,
  session: any,
  loading: boolean
}>;

if (!authState?.value.user) {
  // redirection immédiate si l'utilisateur n'est pas connecté
  router.push('/login');
}

const userEmail = computed(() => authState.value.user?.email ?? 'No email available');
const userId = computed(() => authState.value.user?.id ?? 'Unknown');
const createdAt = computed(() => {
  if (!authState.value.user?.created_at) return 'Unknown';
  return new Date(authState.value.user.created_at).toLocaleDateString();
});

const handleLogout = async () => {
  try {
    await authService.signOut();
    authState.value.user = null;
    authState.value.session = null;
    await router.push("/login");
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
</script>

<template>
  <div class="flex align-center justify-between">
    <h1>Profile</h1>
    <Button label="Logout" @click="handleLogout"></Button>
  </div>
  <div class="flex col row-gap-8">
    <Fieldset class="">
      <template #legend>
        <h2>Informations</h2>
      </template>
      <div class="flex col row-gap-24">
        <div class="flex col row-gap-16">
          <div class="form-element vertical">
            <label>User ID :</label>
            <InputText type="text" disabled :value="userId" />
          </div>
          <div class="form-element vertical">
            <label>Email :</label>
            <InputText type="text" disabled :value="userEmail" />
          </div>
        </div>
        <div class="form-element vertical">
          <label>Account creation : </label>
          <span style="padding-left: 20px; font-weight: bold">{{ createdAt }}</span>
        </div>
      </div>
    </Fieldset>
    <Fieldset class="">
      <template #legend>
        <h2>Account administration</h2>
      </template>
      <div class="flex col row-gap-16">
        <div class="form-element vertical">
          <label>Reset password :</label>
          <Button label="Send a link" variant="outlined" severity="warn" />
        </div>
        <div class="form-element vertical">
          <label>Delete account :</label>
          <Button label="Delete account" severity="danger" />
        </div>
      </div>
    </Fieldset>
  </div>
</template>
