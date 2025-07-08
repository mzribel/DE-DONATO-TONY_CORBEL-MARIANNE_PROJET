<script setup lang="ts">
import {computed, inject, onMounted, ref} from 'vue';
import { useSettingsForm } from '../composables/useSettingsForm';

import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import Button from 'primevue/button';
import ToggleSwitch from "primevue/toggleswitch";
import FieldSet from "primevue/fieldset";
import ProgressSpinner from "primevue/progressspinner";
import ConfirmDialog from "../components/ConfirmDialog.vue"
import {useNotifications} from "../composables/useNotifications";
import {useSoundNotification} from "../composables/useSoundNotifications";

const {
  localSettings,
  settings,
  loading,
  saving,
  hasChanged,
  loadSettings,
  saveChanges,
  cancelChanges,
  resetSettings
} = useSettingsForm();

onMounted(() => {
  loadSettings(userId);
});

const showConfirm = ref(false);
const userId:string = inject("userId")

const enableNotifications = computed(() => settings.value?.notifications_enabled ?? false);
const { sendNotification } = useNotifications(enableNotifications);
const sendTestNotification = () => {
  sendNotification("Notification de test", "Ma mère en ski");
}

const enableSound = computed(() => settings.value?.sound_enabled ?? false);
const { playSound } = useSoundNotification(enableSound, "test_sound.mp3");
const playTestSound = () => {
  playSound();
}
</script>

<template>
  <ConfirmDialog v-model="showConfirm" @confirm="resetSettings(userId)"/>
    <div class="flex justify-between">
      <h1>Settings</h1>
      <Button @click="showConfirm=true" size="small" variant="outlined" severity="danger" v-if="settings">Reset settings</Button>
    </div>
    <div v-if="loading" class="flex flex-1 align-center justify-between">
      <ProgressSpinner style="width: 75px; height: 75px" strokeWidth="3" fill="transparent" />
    </div>
    <div v-else-if="settings" class="flex col row-gap-16">
      <FieldSet>
        <template #legend>
          <h2>Timer</h2>
        </template>
        <div class="form-group">
          <div class="form-element vertical">
            <label for="pomodoro-duration">Focus duration (min) :</label>
            <InputNumber type="text" id="pomodoro-duration" v-model="localSettings.pomodoro_duration"></InputNumber>
          </div>
          <div class="form-element vertical">
            <label for="short-break-duration">Short break duration (min) :</label>
            <InputNumber type="text" id="short-break-duration" v-model="localSettings.short_break_duration"></InputNumber>
          </div>
          <div class="form-element vertical">
            <label for="long-break-duration">Long break duration (min) :</label>
            <InputNumber type="text" id="long-break-duration" v-model="localSettings.long_break_duration"></InputNumber>
          </div>
          <div class="form-element vertical">
            <label for="cycles-before-long-break">Cycles before long break :</label>
            <InputNumber type="text" id="cycles-before-long-break" v-model="localSettings.cycles_before_long_break"></InputNumber>
            <Message severity="secondary" variant="simple" size="small">A classic Pomodoro is 4 cycles of focus + short break before a long break</Message>
          </div>
        </div>

      </FieldSet>
      <FieldSet>
        <template #legend>
          <h2>Sounds and notifications</h2>
        </template>
        <div class="form-group">
          <div class="form-element justify-between align-center">
            <div>
              <label for="">Timer end sound</label>
              <Message severity="secondary" variant="simple" size="small">Play a sound when the timer ends</Message>
            </div>
            <div class="form-element horizontal align-center">
              <Button @click="playTestSound" v-if="settings.sound_enabled" icon="pi pi-volume-up" rounded aria-label="Save" size="small" variant="outlined" severity="contrast"/>
              <ToggleSwitch v-model="localSettings.sound_enabled"/>
            </div>
          </div>
          <div class="form-element justify-between align-center">
            <div>
              <label for="">Timer end notification</label>
              <Message severity="secondary" variant="simple" size="small">Show a notification when the timer ends</Message>
            </div>
            <div class="form-element horizontal align-center">
              <Button @click="sendTestNotification" icon="pi pi-envelope" rounded aria-label="Save" size="small" variant="outlined" severity="contrast"/>
              <ToggleSwitch v-model="localSettings.notifications_enabled" />
            </div>
          </div>
        </div>
      </FieldSet>

      <div class="button-bar">
        <Button icon="pi pi-times" label="Cancel" @click="cancelChanges" severity="secondary" />
        <Button icon="pi pi-check" label="Save" @click="saveChanges(userId)" :disabled="!hasChanged" :loading="saving"/>
      </div>
    </div>
</template>

<style>


.button-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

h1, h2{
  margin: 0;
}

.p-progressspinner-circle {
  animation: p-progressspinner-dash 1.5s ease-in-out infinite !important;
}
</style>