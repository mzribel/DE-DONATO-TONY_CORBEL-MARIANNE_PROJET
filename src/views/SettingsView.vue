<script setup lang="ts">
import {computed, inject, onMounted, Ref, ref, watch} from 'vue';
// Services
import { useSettingsForm } from '../composables/useSettingsForm';
import { useNotifications } from "../composables/useNotifications";
import { useSoundNotification } from "../composables/useSoundNotifications";
// Components
import ConfirmDialog from "../components/ConfirmDialog.vue"
// PrimeVue
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import Button from 'primevue/button';
import ToggleSwitch from "primevue/toggleswitch";
import FieldSet from "primevue/fieldset";
import ProgressSpinner from "primevue/progressspinner";
import Dialog from "primevue/dialog"
import DataTable from "primevue/datatable"
import Column from 'primevue/column';
import { ringtones } from "../types/ringtones";
import {Settings} from "../types/settings";

const settings = inject('settings') as Ref<Settings | null>;
const {
  localSettings,
  loadSettings,
  saveChanges,
  hasChanged,
  cancelChanges,
  resetSettings,
  loading,
  saving
} = useSettingsForm(settings);

onMounted(() => {
  loadSettings(userId.value);
});

const modalVisible = ref(false);
watch(modalVisible, (visible) => {
  if (visible) {
    tempSelectedRingtone.value = selectedRingtone.value;
  }
});

const showConfirm = ref(false);
const userId = inject('userId') as Ref<string>;

// Variables de notification
const selectedRingtone = ref<typeof ringtones[0]>(ringtones[0]); // la valeur effective
const textNotificationEnabled = computed(()=>localSettings.value.notifications_enabled);
const soundNotificationEnabled = computed(()=>localSettings.value.sound_enabled);
const { sendNotification } = useNotifications(textNotificationEnabled);
const { playSound } = useSoundNotification(localSettings.value.ringtone_id, soundNotificationEnabled);

function sendTestNotification() {
  if (localSettings.value.notifications_enabled) {
    sendNotification("Test", "Ça fonctionne !");
  }
  playSound();
}

watch(
  () => localSettings.value.ringtone_id,
  (newId) => {
    const match = ringtones.find(r => r.id === newId);
    if (match) {
      selectedRingtone.value = match;
    }
  },
  { immediate: true }
);
const tempSelectedRingtone = ref<typeof ringtones[0] | null>(null); // sélection en cours dans la modale

let previewAudio: HTMLAudioElement | null = null;

function playPreview(file: string) {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio.currentTime = 0;
  }

  previewAudio = new Audio(file);
  previewAudio.play().catch(err => console.error("Playback error:", err));
}

// Validation
function confirmSelection() {
  if (!tempSelectedRingtone.value) return;

  selectedRingtone.value = tempSelectedRingtone.value;
  localSettings.value.ringtone_id = tempSelectedRingtone.value.id;
  modalVisible.value = false;
}

let lastSelectedRingtone: typeof ringtones[0] | null = null;

function onSelectionChange(newSelection: typeof ringtones[0] | null) {
  if (newSelection) {
    tempSelectedRingtone.value = newSelection;
    lastSelectedRingtone = newSelection;
  } else if (lastSelectedRingtone) {
    tempSelectedRingtone.value = lastSelectedRingtone;
  }
}

</script>

<template>
  <ConfirmDialog v-model="showConfirm" @confirm="resetSettings(userId)" title="Reset settings" message="Reset all settings to default ?"/>
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
            <label for="cycles-before-long-break">Pomodoros before long break :</label>
            <InputNumber type="text" id="cycles-before-long-break" v-model="localSettings.cycles_before_long_break"></InputNumber>
            <Message severity="secondary" variant="simple" size="small">A classic session is 4 pomodoros with short breaks in between, before a long break</Message>
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
              <ToggleSwitch v-model="localSettings.sound_enabled"/>
            </div>
          </div>
          <div class="form-element col">
            <label for="">Preferred ringone</label>
            <Button
              @click="modalVisible = true"
              :label="selectedRingtone?.name || 'Choose a ringtone'"
              variant="outlined"
              severity="secondary"
              class="ringtone-btn"
            />
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
  <Dialog v-model:visible="modalVisible" modal header="Choose a ringtone" class="ringtone-modal">
      <DataTable
        v-model:selection="tempSelectedRingtone"
        :value="ringtones"
        selection-mode="single"
        dataKey="id"
        @update:selection="onSelectionChange"
      >
        <Column field="name" header="Name"></Column>
        <Column header="Play">
          <template #body="{ data }">
            <div class="flex justify-end">
              <Button
                icon="pi pi-volume-up"
                rounded
                size="small"
                variant="outlined"
                severity="contrast"
                @click="playPreview(data.file)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    <div class="button-group justify-end">
      <Button icon="pi pi-times" type="button" label="Cancel" severity="secondary" size="medium" @click="modalVisible = false" />
      <Button
        icon="pi pi-check"
        type="button"
        label="Confirm"
        severity="danger"
        size="medium"
        @click="confirmSelection"
      />
    </div>
  </Dialog>
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
thead {
  display: none;
}
.p-progressspinner-circle {
  animation: p-progressspinner-dash 1.5s ease-in-out infinite !important;
}
.ringtone-btn {
  justify-content: flex-start !important;
}
.ringtone-modal {
  width: min(600px, 95%);

}
.ringtone-modal .p-dialog-content {
  display: flex;
  flex-direction: column;
  row-gap: 16px;
}
</style>