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

function updatePomodoroDuration() {
  // Exemple : mettre la durée Pomodoro à 30 min
  updateSettings({ pomodoroDuration: 30 });
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
      <p>Durée Pomodoro : {{ settings.pomodoroDuration }} min</p>
      <p>Pause courte : {{ settings.shortBreakDuration }} min</p>
      <p>Pause longue : {{ settings.longBreakDuration }} min</p>
      <p>Notifications : {{ settings.notificationsEnabled ? 'activées' : 'désactivées' }}</p>
      <button @click="updatePomodoroDuration">Mettre à 30 min</button>
      <button @click="resetAllSettings">Réinitialiser</button>
    </div>
  </div>
</template>
