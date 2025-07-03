<script setup lang="ts">
import {computed, inject, onMounted, onUnmounted, ref, watch} from 'vue';
import type {AuthState } from "../types/AuthState";
import type { TimerType } from "../types/TimerType";

import * as settingsService from "../services/supabase/settingsService";

const authState = inject<{ value: AuthState }>('authState');

const timerType = ref<TimerType>('pomodoro');
const isRunning = ref(false);
const timeLeft = ref(0);
const settings = ref(null);
const completedPomodoros = ref(0);

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const timerLabel = computed(() => {
  switch (timerType.value) {
    case 'pomodoro': return 'Focus Time';
    case 'shortBreak': return 'Short Break';
    case 'longBreak': return 'Long Break';
  }
});

let timerInterval: number | null = null;
const startTimer = () => {
  if (isRunning.value) return;

  isRunning.value = true;
  timerInterval = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      completeTimer();
    }
  }, 1000);
};

const pauseTimer = () => {
  if (!isRunning.value) return;

  isRunning.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const resetTimer = () => {
  pauseTimer();
  setTimerDuration();
};

const completeTimer = () => {
  pauseTimer();

  if (settings.value.soundEnabled) {
    const audio = new Audio('/notification.mp3');
    audio.play();
  }

  if (settings.value.notificationsEnabled) {
    const title = `${timerLabel.value} Completed!`;
    const body = timerType.value === 'pomodoro' 
      ? 'Time for a break!' 
      : 'Time to focus!';

    window.electronAPI.notify(title, body);
  }

  const sessionData = {
    type: timerType.value,
    duration: getDurationForType(timerType.value),
    startTime: new Date(Date.now() - getDurationForType(timerType.value) * 1000).toISOString(),
    endTime: new Date().toISOString(),
    userId: authState?.value?.user?.id
  };
  window.electronAPI.saveSession(sessionData);

  if (timerType.value === 'pomodoro') {
    completedPomodoros.value++;

    if (completedPomodoros.value % 4 === 0) {
      timerType.value = 'longBreak';
    } else {
      timerType.value = 'shortBreak';
    }
  } else {
    timerType.value = 'pomodoro';
  }

  setTimerDuration();
};

const setTimerDuration = () => {
  timeLeft.value = getDurationForType(timerType.value) * 60;
};

const getDurationForType = (type: TimerType): number => {
  switch (type) {
    case 'pomodoro': return settings.value.pomodoro_duration;
    case 'shortBreak': return settings.value.short_break_duration;
    case 'longBreak': return settings.value.long_break_duration;
  }
};

const skipSession = () => {
  completeTimer();
};

const changeTimerType = (type: TimerType) => {
  if (timerType.value === type) return;

  timerType.value = type;
  resetTimer();
};

onMounted(async () => {
  try {
    // const userId = authState?.value?.user?.id;
    settings.value = await settingsService.getSettings();
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  setTimerDuration();

  window.addEventListener('keydown', handleKeyDown);

  document.addEventListener('shortcut:toggle-timer', () => {
    isRunning.value ? pauseTimer() : startTimer();
  });

  document.addEventListener('shortcut:skip-session', skipSession);
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  window.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('shortcut:toggle-timer', () => {});
  document.removeEventListener('shortcut:skip-session', skipSession);
});

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code === 'Space' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
    isRunning.value ? pauseTimer() : startTimer();
  }

  if (event.code === 'KeyS' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
    skipSession();
  }
};

watch(formattedTime, (newTime) => {
  document.title = `${newTime} - ${timerLabel.value} | Pomodoro App`;
});
</script>

<template>
  <div class="pomodoro-container">
    <div class="timer-type-selector">
      <button 
        :class="{ active: timerType === 'pomodoro' }" 
        @click="changeTimerType('pomodoro')"
      >
        Pomodoro
      </button>
      <button 
        :class="{ active: timerType === 'shortBreak' }" 
        @click="changeTimerType('shortBreak')"
      >
        Short Break
      </button>
      <button 
        :class="{ active: timerType === 'longBreak' }" 
        @click="changeTimerType('longBreak')"
      >
        Long Break
      </button>
    </div>

    <div class="timer-display">
      <h1>{{ formattedTime }}</h1>
      <p>{{ timerLabel }}</p>
    </div>

    <div class="timer-controls">
      <button class="control-button" @click="isRunning ? pauseTimer() : startTimer()">
        {{ isRunning ? 'Pause' : 'Start' }}
      </button>
      <button class="control-button" @click="resetTimer()">Reset</button>
      <button class="control-button" @click="skipSession()">Skip</button>
    </div>

    <div class="pomodoro-count">
      <p>Completed Pomodoros: {{ completedPomodoros }}</p>
    </div>

    <div class="keyboard-shortcuts">
      <p>Keyboard Shortcuts:</p>
      <ul>
        <li><strong>Space</strong> - Start/Pause</li>
        <li><strong>S</strong> - Skip </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.pomodoro-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.timer-type-selector {
  display: flex;
  margin-bottom: 2rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
}

.timer-type-selector button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timer-type-selector button.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.timer-display {
  text-align: center;
  margin-bottom: 2rem;
}

.timer-display h1 {
  font-size: 6rem;
  margin: 0;
  line-height: 1;
}

.timer-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-button {
  min-width: 100px;
}

.pomodoro-count {
  margin-bottom: 2rem;
}

.keyboard-shortcuts {
  text-align: left;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
}

.keyboard-shortcuts ul {
  padding-left: 1.5rem;
}
</style>
