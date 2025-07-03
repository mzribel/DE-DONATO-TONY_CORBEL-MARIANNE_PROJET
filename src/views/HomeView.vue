<script setup lang="ts">
import Button from 'primevue/button';
import { ref } from "vue";

// Simulation récupération de ton setting via Supabase ou passé en prop
const enableNotifications = ref(true); // Remplace par ta récupération réelle

</script>

<template>
  <h1>Home</h1>
  <div class="card">
    <Button>Test</Button>
    <button type="button" @click="sendNotification('alloRH ?', 'hehe')">Send a notification !</button>
    <input type="checkbox" v-model="enableNotifications" />
    {{ enableNotifications }}
    <p>Ctrl+maj+i pour ouvrir la console !</p>
  </div>
</template>

<style scoped>
</style>
