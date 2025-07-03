<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { Bar } from 'vue-chartjs';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import type { AuthState } from "../types/AuthState";
import type { Session } from "../types/Session";
import * as sessionService from "../services/supabase/sessionService";

const authState = inject<{ value: AuthState }>('authState');

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const sessions = ref<Session[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const timeFrame = ref<'day' | 'week' | 'month'>('day');

const formattedSessions = computed(() => {
  return sessions.value.map(session => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    return {
      ...session,
      formattedStartTime: formatDateTime(start),
      formattedEndTime: formatDateTime(end),
      formattedDuration: formatDuration(session.duration * 60)
    };
  });
});


// TODO : voir pour simplifier
const chartData = computed(() => {
  const filteredSessions = filterSessionsByTimeFrame(sessions.value, timeFrame.value);

  const sessionsByDate = groupSessionsByDate(filteredSessions);

  const labels = Object.keys(sessionsByDate);
  const pomodoroData = labels.map(date => 
    calculateTotalDuration(sessionsByDate[date].filter(s => s.type === 'pomodoro'))
  );
  const shortBreakData = labels.map(date => 
    calculateTotalDuration(sessionsByDate[date].filter(s => s.type === 'shortBreak'))
  );
  const longBreakData = labels.map(date => 
    calculateTotalDuration(sessionsByDate[date].filter(s => s.type === 'longBreak'))
  );

  return {
    labels,
    datasets: [
      {
        label: 'Focus Time',
        backgroundColor: '#e74c3c',
        data: pomodoroData
      },
      {
        label: 'Short Breaks',
        backgroundColor: '#3498db',
        data: shortBreakData
      },
      {
        label: 'Long Breaks',
        backgroundColor: '#2ecc71',
        data: longBreakData
      }
    ]
  };
});


// TODO : repasser dessus une fois le switch de mode "coin de bureau" à "desktop" implémenté
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Minutes'
      }
    }
  }
};

const totalFocusTime = computed(() => {
  const pomodoroSessions = sessions.value.filter(s => s.type === 'pomodoro');
  const totalMinutes = calculateTotalDuration(pomodoroSessions);
  return formatDuration(totalMinutes * 60); // Convert minutes to seconds
});

const totalSessions = computed(() => {
  return sessions.value.filter(s => s.type === 'pomodoro').length;
});


// TODO : repasser dessus une fois la connnexxion a la base de données ajoutée
const loadSessions = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const userId = authState?.value?.user?.id;
    sessions.value = await sessionService.getSessions(userId);
  } catch (err) {
    console.error('Failed to load sessions:', err);
    error.value = 'Failed to load session history. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const formatDateTime = (date: Date): string => {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

const filterSessionsByTimeFrame = (sessions: Session[], timeFrame: 'day' | 'week' | 'month'): Session[] => {
  const now = new Date();
  const cutoff = new Date();

  switch (timeFrame) {
    case 'day':
      cutoff.setDate(now.getDate() - 1);
      break;
    case 'week':
      cutoff.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoff.setMonth(now.getMonth() - 1);
      break;
  }

  return sessions.filter(session => new Date(session.startTime) >= cutoff);
};

const groupSessionsByDate = (sessions: Session[]): Record<string, Session[]> => {
  const result: Record<string, Session[]> = {};

  sessions.forEach(session => {
    const date = new Date(session.startTime).toLocaleDateString();
    if (!result[date]) {
      result[date] = [];
    }
    result[date].push(session);
  });

  return result;
};

const calculateTotalDuration = (sessions: Session[]): number => {
  return sessions.reduce((total, session) => total + session.duration, 0);
};

const changeTimeFrame = (frame: 'day' | 'week' | 'month') => {
  timeFrame.value = frame;
};

onMounted(() => {
  loadSessions();
});
</script>

<template>
  <div class="history-container">
    <h2>Session History</h2>

    <div class="stats-summary">
      <div class="stat-card">
        <h3>Total Focus Time</h3>
        <p class="stat-value">{{ totalFocusTime }}</p>
      </div>
      <div class="stat-card">
        <h3>Completed Sessions</h3>
        <p class="stat-value">{{ totalSessions }}</p>
      </div>
    </div>

    <div class="chart-container">
      <div class="time-frame-selector">
        <button 
          :class="{ active: timeFrame === 'day' }" 
          @click="changeTimeFrame('day')"
        >
          Day
        </button>
        <button 
          :class="{ active: timeFrame === 'week' }" 
          @click="changeTimeFrame('week')"
        >
          Week
        </button>
        <button 
          :class="{ active: timeFrame === 'month' }" 
          @click="changeTimeFrame('month')"
        >
          Month
        </button>
      </div>

      <div class="chart" v-if="!isLoading && sessions.length > 0">
        <Bar :data="chartData" :options="chartOptions" height="250" />
      </div>

      <div class="no-data" v-else-if="!isLoading && sessions.length === 0">
        <p>No session history available. Complete your first session to see statistics.</p>
      </div>

      <div class="loading" v-else>
        <p>Loading session history...</p>
      </div>
    </div>

    <div class="session-list">
      <h3>Recent Sessions</h3>

      <div v-if="isLoading" class="loading">
        <p>Loading sessions...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="loadSessions">Try Again</button>
      </div>

      <div v-else-if="sessions.length === 0" class="no-data">
        <p>No sessions recorded yet.</p>
      </div>

      <table v-else class="sessions-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Duration</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in formattedSessions.slice(0, 10)" :key="session.id">
            <td>
              <span 
                class="session-type" 
                :class="{
                  'pomodoro': session.type === 'pomodoro',
                  'short-break': session.type === 'shortBreak',
                  'long-break': session.type === 'longBreak'
                }"
              >
                {{ session.type === 'pomodoro' ? 'Focus' : 
                   session.type === 'shortBreak' ? 'Short Break' : 'Long Break' }}
              </span>
            </td>
            <td>{{ session.formattedDuration }}</td>
            <td>{{ session.formattedStartTime }}</td>
            <td>{{ session.formattedEndTime }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.history-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.stats-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.chart-container {
  margin-bottom: 2rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.time-frame-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.time-frame-selector button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-frame-selector button.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.chart {
  height: 250px;
}

.no-data, .loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.sessions-table {
  width: 100%;
  border-collapse: collapse;
}

.sessions-table th, .sessions-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.session-type {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.session-type.pomodoro {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.session-type.short-break {
  background-color: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.session-type.long-break {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}
</style>
