<script setup lang="ts">
import { inject, ref, onMounted, computed, Ref } from 'vue';
// Services
import { sessionsService } from "../services/supabase/newSessionService";
import { SESSION_PART_LABELS } from "../types/sessions";
import { useSettingsForm } from '../composables/useSettingsForm';
import { useSessionRunner } from "../composables/useSessionRunner";
// PrimeVue
import Panel from 'primevue/panel';
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from "primevue/progressspinner";

// Variables globales
const sessionRunner = inject('sessionRunner') as ReturnType<typeof useSessionRunner>;
const userId = inject('userId') as Ref<string>;

const {
  settings,
  loading,
  loadSettings,
} = useSettingsForm();

const skipLoading = ref<boolean>(false);
const startLoading = ref<boolean>(false);
const stopLoading = ref<boolean>(false);
const disableButton = computed(() => {
  return skipLoading.value || stopLoading.value || startLoading.value;
})

async function activateButton(callback: () => Promise<void>, ref: Ref<boolean>): Promise<void> {
  ref.value = true;
  await callback();
  ref.value = false;
}

async function clickStartButton(callback: () => Promise<void>): Promise<void> {
  return activateButton(callback, startLoading)
}
async function clickSkipButton(callback: () => Promise<void>): Promise<void> {
  return activateButton(callback, skipLoading)
}
async function clickStopButton(callback: () => Promise<void>): Promise<void> {
  return activateButton(callback, stopLoading)
}

onMounted(async () => {
  await loadSettings(userId.value);
  form.value = {
    pomodoro_duration: settings.value.pomodoro_duration,
    short_break_duration: settings.value.short_break_duration,
    long_break_duration: settings.value.long_break_duration,
    cycles_before_long_break: settings.value.cycles_before_long_break,
    total_cycles: settings.value.cycles_before_long_break,
    auto_repeat: settings.value.auto_repeat,
    auto_start: settings.value.auto_start
  }
});

// État local du formulaire
const form = ref(null);

const totalDuration = computed(()=> {
  const longBreaks = Math.floor(form.value.total_cycles / form.value.cycles_before_long_break);
  const shortBreaks = form.value.total_cycles - longBreaks;

  return (
    form.value.pomodoro_duration * form.value.total_cycles
    + form.value.short_break_duration * shortBreaks
    + form.value.long_break_duration * longBreaks
  ) * 60
})
const estimatedEndTime = computed(() => {
  const start = new Date(); // maintenant
  const endTimestamp = start.getTime() + totalDuration.value * 1000;
  return new Date(endTimestamp);
});

// Lancer une nouvelle session
async function startNewSession() {
  const { data: session, _ } = await sessionsService.createSession({
    user_id: userId.value,
    pomodoro_duration: form.value.pomodoro_duration * 60,
    short_break_duration: form.value.short_break_duration * 60,
    long_break_duration: form.value.long_break_duration * 60,
    cycles_before_long_break: form.value.cycles_before_long_break,
    total_cycles: form.value.total_cycles,
    auto_repeat: false,
    auto_start: false,
  });

  // Créé la première partie directement
  await sessionsService.createSessionPart(session.id, {
    type: 'pomodoro',
    duration: form.value.pomodoro_duration * 60,
  });
  await sessionRunner.loadCurrentSession();
}

// Calcul label type part
const partLabel = computed(() => {
  if (!sessionRunner.currentPart.value) return '';
  return SESSION_PART_LABELS[sessionRunner.currentPart.value.type] ?? sessionRunner.currentPart.value.type;
});

// Timer en cours
const timerRunning = computed(() => !sessionRunner.isPaused.value && !!sessionRunner.currentPart.value);

// Formatage hh:mm:ss
function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}
</script>

<template>
    <h1>Pomodoro</h1>

    <!-- Chargement -->
    <div v-if="sessionRunner.isLoading.value || loading" class="flex flex-1 align-center justify-between">
      <ProgressSpinner style="width: 75px; height: 75px" strokeWidth="3" fill="transparent" />
    </div>

    <!-- Aucune session active -->
    <div v-else-if="!sessionRunner.currentSession.value && form" class="flex col row-gap-16">
      <div class="flex col row-gap-8 preview-container">
        <div>
          <Panel header="Pomodoro" class="preview">
            <span class="time">{{ formatTime(form.pomodoro_duration * 60) }}</span>
          </Panel>
        </div>
        <div class="flex col-gap-8">
          <Panel header="Short break" class="flex flex-1 preview">
            <span class="time small">{{ formatTime(form.short_break_duration * 60) }}</span>
          </Panel>
          <Panel v-if="form.cycles_before_long_break <= form.total_cycles" header="Long break" class="flex flex-1 preview justify-center">
            <span class="time small">{{ formatTime(form.long_break_duration * 60) }}</span>
          </Panel>
        </div>
      </div>
      <div class="preview-info">
        <div><b>Total Pomodoros :</b> {{ form.total_cycles}}</div>
        <div v-if="form.cycles_before_long_break <= form.total_cycles" ><b>Pomodoros before long break :</b> {{ form.cycles_before_long_break }}</div>
        <div><b>Est. end time :</b> {{ estimatedEndTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }} ({{ formatTime(totalDuration) }}min)</div>
      </div>
      <Button @click="startNewSession" label="Start" icon="pi pi-caret-right" :loading="startLoading" :disabled="disableButton"></Button>
    </div>

    <!-- Session en cours -->
    <div v-else>
      <h3>{{ partLabel }} | {{ formatTime(sessionRunner.remainingTime.value) }}</h3>
      <ProgressBar :value="sessionRunner.progress.value" class="spinner">&nbsp;</ProgressBar>

      <div class="buttons">
        <template v-if="!sessionRunner.isTimerRunning.value">
          <Button @click="clickStartButton(sessionRunner.startTimer)" icon="pi pi-caret-right" label="Start" :disabled="disableButton" :loading="startLoading"></Button>
        </template>
        <template v-else>
          <Button v-on:click="clickStartButton(sessionRunner.pauseTimer)" v-if="!sessionRunner.isPaused.value" icon="pi pi-pause" label="Pause" variant="outlined" :loading="startLoading" :disabled="disableButton"></Button>
          <Button @click="clickStartButton(sessionRunner.resumeTimer)" v-else icon="pi pi-caret-right" label="Resume" :disabled="disableButton" :loading="startLoading"></Button>
        </template>
        <Button @click="clickSkipButton(sessionRunner.skipCurrentPart)" icon="pi pi-angle-double-right" label="Skip" severity="danger" variant="outlined" :disabled="disableButton" :loading="skipLoading"></Button>
        <Button @click="clickStopButton(sessionRunner.cancelCurrentSession)" icon="pi pi-times" label="Stop session" severity="danger" :disabled="disableButton" :loading="stopLoading"></Button>
      </div>
    </div>
</template>

<style>
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
.preview .time {
  font-size: 50px;
  font-weight: bold;
}
.p-panel-content {
  display: flex;
  justify-content: center;
}

.spinner {
  stroke-width: 8px;
}
</style>
