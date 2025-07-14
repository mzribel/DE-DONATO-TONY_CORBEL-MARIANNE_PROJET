<script setup lang="ts">
import Panel from 'primevue/panel';
import Button from 'primevue/button';

defineProps<{
  title: string;
  submitLabel: string;
  loadingLabel?: string;
  errorMessage?: string;
  successMessage?: string;
  isLoading: boolean;
  onSubmit: () => Promise<void>;
  alternateText?: string;
  alternateLink?: string;
}>();
</script>

<template>
  <Panel class="auth-form">
    <template #header>
      <h1>{{ title }}</h1>
    </template>

    <div class="flex flex-1 col">
      <form class="flex col row-gap-24" @submit.prevent="onSubmit">
        <slot />

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <Button :disabled="isLoading" type="submit">
          {{ isLoading ? loadingLabel ?? 'Submitting...' : submitLabel }}
        </Button>
      </form>

      <div v-if="alternateText && alternateLink" class="auth-link">
        <router-link :to="alternateLink">{{ alternateText }}</router-link>
      </div>
    </div>
  </Panel>
</template>

<style scoped>
.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
}
.success-message {
  color: #2ecc71;
  font-size: 0.9rem;
}
</style>
