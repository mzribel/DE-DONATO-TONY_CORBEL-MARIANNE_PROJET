<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettings } from '../composables/useSettings';

const {
  settings,
  loading,
  loadSettings,
  updateSettings,
  resetSettings,
} = useSettings();

onMounted(() => {
  loadSettings();
});

const userID = "06a29c38-1879-49f8-a54c-db4b829a2b4c";

function updatePomodoroDuration() {
  // Exemple : mettre la durée Pomodoro à 30 min
  updateSettings({ pomodoro_duration: 30 });
}

function resetAllSettings() {
  resetSettings();
}
</script>

<template>
  <div>
    <h1>Paramètres</h1>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="settings">
      <p>Durée Pomodoro : {{ settings.pomodoro_duration }} min</p>
      <p>Pause courte : {{ settings.short_break_duration }} min</p>
      <p>Pause longue : {{ settings.long_break_duration }} min</p>
      <p>Notifications : {{ settings.notifications_enabled ? 'activées' : 'désactivées' }}</p>
      <button @click="updatePomodoroDuration">Mettre à 30 min</button>
      <button @click="resetAllSettings">Réinitialiser</button>
    </div>
  </div>
</template>
