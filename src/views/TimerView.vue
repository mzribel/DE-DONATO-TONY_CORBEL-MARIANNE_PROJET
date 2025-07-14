<script setup lang="ts">
// Imports
import { computed, inject, ref, watch, Ref } from "vue";
import { useSessionRunner } from "../composables/useSessionRunner";
import { useNotifications } from "../composables/useNotifications";
import { useSoundNotification } from "../composables/useSoundNotifications";
import { sessionsService } from "../services/supabase/newSessionService";
import { SESSION_PART_LABELS } from "../types/sessions";
import { Settings } from "../types/settings";
import { formatTime } from "../utils/format";
// PrimeVue
import ProgressSpinner from "primevue/progressspinner";
import Panel from "primevue/panel";
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";

// Injection des dépendances globales
const userId = inject('userId') as Ref<string>;
const settings = inject('settings') as Ref<Settings | null>;
const sessionRunner = inject('sessionRunner') as Ref<ReturnType<typeof useSessionRunner> | null>;

// Variables de notification
const textNotificationEnabled = ref(false);
const soundNotificationEnabled = ref(false);
const ringtone_id = ref<number | null>(null);
const { sendNotification } = useNotifications(textNotificationEnabled);
const { playSound } = useSoundNotification(ringtone_id, soundNotificationEnabled);

// Initialisation du runner lorsqu'il est disponible
watch(
  () => sessionRunner.value,
  async (runner) => {
    if (runner && settings.value) {
      await runner.loadCurrentSession();
      ringtone_id.value = settings.value.ringtone_id;
      soundNotificationEnabled.value = settings.value.sound_enabled;
      textNotificationEnabled.value = settings.value.notifications_enabled;
    }
  },
  { immediate: true }
);

// Gestion de la détection de fin de part
let timerEndedNaturally = false;

// 1. Détection de fin naturelle du timer
watch(
  () => sessionRunner.value?.remainingTime,
  (newVal, oldVal) => {
    if (oldVal > 0 && newVal === 0) {
      timerEndedNaturally = true;
    }
  }
);

// 2. Notification au changement de part
watch(
  () => sessionRunner.value?.currentPart,
  (newPart, oldPart) => {
    if (!newPart || !oldPart || newPart.id === oldPart.id) return;
    if (timerEndedNaturally) {
      timerEndedNaturally = false;
      if (newPart.type == "pomodoro") {
        sendNotification('Pause terminée !', 'Allez hop on se remet au travail !');
      } else {
        sendNotification('Pomodoro terminé !', 'Profite bien de ta pause.');
      }
      playSound();
    }
  }
);


// État du formulaire local
const currentPart = computed(() => {
  return sessionRunner.value?.currentPart ?? null;
});

const totalDuration = computed(() => {
  if (!settings.value) return 0;
  const longBreaks = Math.floor(4 / settings.value.cycles_before_long_break);
  const shortBreaks = 4 - longBreaks;

  return (
    settings.value.pomodoro_duration * 4 +
    settings.value.short_break_duration * shortBreaks +
    settings.value.long_break_duration * longBreaks
  ) * 60;
});

const estimatedEndTime = computed(() => {
  const now = new Date();
  return new Date(now.getTime() + totalDuration.value * 1000);
});

const partLabel = computed(() => {
  if (!currentPart.value) return "";
  return SESSION_PART_LABELS[currentPart.value.type] ?? currentPart.value.type;
});

// Gestion des boutons de contrôle
const skipLoading = ref(false);
const startLoading = ref(false);
const stopLoading = ref(false);

const disableButton = computed(() => {
  return skipLoading.value || stopLoading.value || startLoading.value;
});

async function activateButton(callback: () => Promise<void>, ref: Ref<boolean>): Promise<void> {
  ref.value = true;
  await callback();
  ref.value = false;
}

async function clickStartButton(callback: () => Promise<void>): Promise<void> {
  return activateButton(callback, startLoading);
}

async function clickSkipButton(callback: () => Promise<void>): Promise<void> {
  return activateButton(callback, skipLoading);
}

async function clickStopButton(callback: () => Promise<void>): Promise<void> {
  return activateButton(callback, stopLoading);
}

// Création d'une nouvelle session
async function startNewSession() {
  if (!settings.value) return;

  const { data: session } = await sessionsService.createSession({
    user_id: userId.value,
    pomodoro_duration: settings.value.pomodoro_duration * 60,
    short_break_duration: settings.value.short_break_duration * 60,
    long_break_duration: settings.value.long_break_duration * 60,
    cycles_before_long_break: settings.value.cycles_before_long_break,
    total_cycles: 4,
    auto_repeat: false,
    auto_start: false,
  });

  await sessionsService.createSessionPart(session.id, {
    type: 'pomodoro',
    duration: settings.value.pomodoro_duration * 60,
  });

  await sessionRunner.value?.loadCurrentSession();
}
</script>

<template>
  <h1>Pomodoro session</h1>
  <div v-if="!sessionRunner || sessionRunner.isLoading || !settings" class="flex flex-1 align-center justify-between">
    <ProgressSpinner style="width: 75px; height: 75px" strokeWidth="3" fill="transparent" />
  </div>
  <div v-else-if="currentPart">
    <div class="flex col align-center row-gap-16">
      <div class="timer-container">
        <div class="timer-label">{{ partLabel }}</div>
        <h3 class="timer">{{ formatTime(sessionRunner.remainingTime) }}</h3>
        <ProgressBar :value="sessionRunner.progress" class="progress-bar"></ProgressBar>
      </div>

      <div class="buttons">
        <template v-if="!sessionRunner.isTimerRunning">
          <Button @click="clickStartButton(sessionRunner.startTimer)" icon="pi pi-caret-right" label="Start" :disabled="disableButton" :loading="startLoading"></Button>
        </template>
        <template v-else>
          <Button v-on:click="clickStartButton(sessionRunner.pauseTimer)" v-if="!sessionRunner.isPaused" icon="pi pi-pause" label="Pause" variant="outlined" :loading="startLoading" :disabled="disableButton"></Button>
          <Button @click="clickStartButton(sessionRunner.resumeTimer)" v-else icon="pi pi-caret-right" label="Resume" :disabled="disableButton" :loading="startLoading"></Button>
        </template>
        <Button @click="clickSkipButton(sessionRunner.skipCurrentPart)" icon="pi pi-angle-double-right" label="Skip" severity="danger" variant="outlined" :disabled="disableButton" :loading="skipLoading"></Button>
        <Button @click="clickStopButton(sessionRunner.cancelCurrentSession)" icon="pi pi-times" label="Stop session" severity="danger" :disabled="disableButton" :loading="stopLoading"></Button>
      </div>
    </div>
  </div>

  <div v-else class="flex col row-gap-8">
    <div class="flex col row-gap-8 preview-container">
      <div>
        <Panel header="Pomodoro" class="preview">
          <span class="time">{{ formatTime(settings.pomodoro_duration * 60) }}</span>
        </Panel>
      </div>
      <div class="flex col-gap-8">
        <Panel header="Short break" class="flex flex-1 preview">
          <span class="time small">{{ formatTime(settings.short_break_duration * 60) }}</span>
        </Panel>
        <Panel header="Long break" class="flex flex-1 preview justify-center">
          <span class="time small">{{ formatTime(settings.long_break_duration * 60) }}</span>
        </Panel>
      </div>
    </div>
    <div class="preview-info">
      <div><b>Total Pomodoros :</b> 4</div>
      <div><b>Pomodoros before long break :</b> {{ settings.cycles_before_long_break }}</div>
      <div><b>Est. end time :</b> {{ estimatedEndTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }} ({{ formatTime(totalDuration) }}min)</div>
    </div>
    <Button @click="startNewSession" label="Start" icon="pi pi-caret-right" :loading="startLoading" :disabled="disableButton"></Button>
  </div>
</template>

<style>

h3.timer {
  font-size: 100px;
}
.timer-label {
  text-transform: uppercase;
  opacity: .75;
  letter-spacing: .1em;
}
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

.progress-bar {
  width: 100%;
}
.timer-container {
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 500px);
}
</style>