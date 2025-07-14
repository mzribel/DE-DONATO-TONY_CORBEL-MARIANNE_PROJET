<script setup lang="ts">
import {inject, onMounted, ref, Ref} from "vue";
// Services
import { useSessions } from "../composables/useSessions";
// PrimeVue
import Panel from "primevue/panel"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Tag from "primevue/tag"
import Button from "primevue/button"
import ProgressSpinner from "primevue/progressspinner";
import {sessionsService} from "../services/supabase/newSessionService";
const { deleteSession } = sessionsService;

const userId = inject('userId') as Ref<string>;
const {
  sessions,
  fetchSessions,
  loading
} = useSessions(userId.value);

onMounted(() => {
  fetchSessions();
});

function formatIsoDateTime(isoString: string) {
  const date = new Date(isoString);

  const dayFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    day: dayFormatter.format(date),   // e.g. "Sun, 13/07/2025"
    time: timeFormatter.format(date), // e.g. "21:03"
  };
}

function getTotalInterruptionDuration(session_part_pauses: any[]): number {
  if (!session_part_pauses) return 0;

  const total = session_part_pauses.reduce((total, pause) => {
    if (pause.started_at && pause.ended_at) {
      const start = new Date(pause.started_at).getTime();
      const end = new Date(pause.ended_at).getTime();
      const durationSec = (end - start) / 1000;
      return total + durationSec;
    }
    return total; // <-- on retourne la valeur d'accumulation si la pause est incomplète
  }, 0);

  return Math.round(total);
}

const deletingId = ref<string>(null);
async function handleDelete(sessionId:string) {
  deletingId.value = sessionId;
  await deleteSession(sessionId);
  await fetchSessions();
  deletingId.value = null;
}

</script>

<template>
  <h1>History</h1>
  <div v-if="loading && !deletingId" class="flex flex-1 align-center justify-between">
    <ProgressSpinner style="width: 75px; height: 75px" strokeWidth="3" fill="transparent" />
  </div>
  <div v-else-if="!sessions || !sessions.length" class="flex flex-1 align-center justify-center no-session">
    No session to show !
  </div>
  <div v-if="sessions.length"  class="flex col row-gap-8">
  <Panel toggleable v-for="session in sessions" collapsed class="session">
    <template #header>
        <div class="flex justify-between flex-1 align-center">
          <div class="flex col session-header">
            <div class="date">{{ formatIsoDateTime(session.created_at).day }}</div>
            <div class="time">{{ formatIsoDateTime(session.created_at).time }}</div>
          </div>
          <Button icon="pi pi-trash" severity="danger" rounded aria-label="Bookmark" variant="outlined" size="small" @click="handleDelete(session.id)" :disabled="deletingId != null" :loading="session.id == deletingId" />
        </div>
    </template>
    <DataTable :value="session.session_parts">
      <Column field="type" header="Type"></Column>
      <Column field="duration" header="Initial duration">
        <template #body="slotProps">
          {{ slotProps.data.duration }}s
        </template>
      </Column>
      <Column header="Elapsed time">
        <template #body="slotProps">
          {{ slotProps.data.duration - slotProps.data.remaining_time }}s
        </template>
      </Column>
      <Column header="Status">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.is_completed" value="Completed" severity="success">Completed</Tag>
          <Tag v-else-if="slotProps.data.is_skipped" value="Skipped" severity="danger">Skipped</Tag>
          <Tag v-else value="Pending" severity="warn">Pending</Tag>
        </template>
      </Column>
      <Column header="Interruptions">
        <template #body="slotProps">
          {{ slotProps.data.session_part_pauses.length }}
          ({{ getTotalInterruptionDuration(slotProps.data.session_part_pauses) }}s)
        </template>
      </Column>
    </DataTable>
  </Panel>
</div>
</template>

<style>
.no-session {
  font-size: 14px;
  opacity: 0.8;
  font-style: italic;
}

.session .p-panel-content {
  justify-content: flex-start !important;
  overflow-x: auto;
}
.session .p-datatable.p-component {
  width: 100%;
}
.session .p-datatable-column-title {
  text-wrap: nowrap;
}
.session-header .date {
  font-style: italic;
  font-size: 14px;
}
.session-header .time {
  font-weight: bold;
  font-size: 20px;
}

</style>