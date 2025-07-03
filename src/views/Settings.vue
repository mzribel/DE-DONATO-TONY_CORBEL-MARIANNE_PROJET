<script setup lang="ts">
import {ref, onMounted, inject} from 'vue';
import {settingsService} from "../services/supabaseService.ts";
import type {AuthState} from "../types";

const authState = inject<{ value: AuthState }>('authState');

const settings = ref({
  pomodoroTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationsEnabled: true
});

const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref('');



onMounted(async () => {
  try {
    const userId = authState?.value?.user?.id;
    const savedSettings = await settingsService.getSettings(userId);
    settings.value = savedSettings || {
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      longBreakInterval: 4,
      soundEnabled: true,
      notificationsEnabled: true
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    saveError.value = 'Failed to load settings. Using defaults.';
  }
});

const saveSettings = async () => {
  isSaving.value = true;
  saveMessage.value = '';
  saveError.value = '';
  
  try {

    const userId = authState?.value?.user?.id;
    await settingsService.saveSettings(userId, settings.value);
    saveMessage.value = 'Settings saved successfully!';

    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to save settings:', error);
    saveError.value = 'Failed to save settings. Please try again.';
  } finally {
    isSaving.value = false;
  }
};

// TODO : peut etre ajuster les valeurs par défaut (mais je crois que c'est ça)
const resetToDefaults = () => {
  settings.value = {
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    notificationsEnabled: true
  };
};
</script>

<template>
  <div class="settings-container">
    <h2>Settings</h2>
    
    <form @submit.prevent="saveSettings" class="settings-form">
      <div class="settings-section">
        <h3>Timer Durations (minutes)</h3>
        
        <div class="form-group">
          <label for="pomodoro-time">Pomodoro Time</label>
          <input 
            type="number" 
            id="pomodoro-time" 
            v-model="settings.pomodoroTime" 
            min="1" 
            max="120"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="short-break-time">Short Break Time</label>
          <input 
            type="number" 
            id="short-break-time" 
            v-model="settings.shortBreakTime" 
            min="1" 
            max="30"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="long-break-time">Long Break Time</label>
          <input 
            type="number" 
            id="long-break-time" 
            v-model="settings.longBreakTime" 
            min="1" 
            max="60"
            required
          />
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Notifications</h3>
        
        <div class="form-group checkbox">
          <input 
            type="checkbox" 
            id="sound-enabled" 
            v-model="settings.soundEnabled"
          />
          <label for="sound-enabled">Enable Sound Alerts</label>
        </div>
        
        <div class="form-group checkbox">
          <input 
            type="checkbox" 
            id="notifications-enabled" 
            v-model="settings.notificationsEnabled"
          />
          <label for="notifications-enabled">Enable Desktop Notifications</label>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="secondary-button" @click="resetToDefaults">
          Reset to Defaults
        </button>
        <button type="submit" class="primary-button" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
      
      <div v-if="saveMessage" class="save-message success">
        {{ saveMessage }}
      </div>
      
      <div v-if="saveError" class="save-message error">
        {{ saveError }}
      </div>
    </form>

  </div>
</template>

<style scoped>
.settings-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.settings-form {
  margin-bottom: 2rem;
}

.settings-section {
  margin-bottom: 2rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input[type="number"] {
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.form-group.checkbox label {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.primary-button, .secondary-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.primary-button:hover {
  background-color: #c0392b;
}

.primary-button:disabled {
  background-color: #e57373;
  cursor: not-allowed;
}

.secondary-button {
  background-color: transparent;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.secondary-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.save-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
}

.save-message.success {
  background-color: rgba(46, 204, 113, 0.2);
  color: #27ae60;
}

.save-message.error {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.settings-info ul {
  padding-left: 1.5rem;
}
</style>