<script setup lang="ts">
import { useSessions } from "../composables/useSessions";
import { inject, onMounted } from "vue";
import Panel from "primevue/panel"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Tag from "primevue/tag"
import Button from "primevue/button"

const userId:string = inject("userId");
const {
  sessions,
  fetchSessions,
} = useSessions(userId);

onMounted(() => {
  fetchSessions();
});

function getTotalInterruptionDuration(session_part_pauses: any[]): number {
  if (!session_part_pauses) return 0;
  const total = session_part_pauses.reduce((total, pause) => {
    if (pause.started_at && pause.ended_at) {
      const start = new Date(pause.started_at).getTime();
      const end = new Date(pause.ended_at).getTime();
      const durationSec = (end - start) / 1000;
      return total + durationSec;
    }
  }, 0);
  return Math.round(total);
}
</script>

<template>
  <h1>History</h1>
  <div v-if="sessions"  class="flex col row-gap-8">
  <Panel toggleable v-for="session in sessions" collapsed>
    <template #header>
      <div class="flex justify-between flex-1">
        <Button icon="pi pi-trash" severity="danger" rounded aria-label="Bookmark" variant="outlined" size="small" />
      </div>
    </template>
    <DataTable :value="session.session_parts">
      <Column field="type" header="Type"></Column>
      <Column field="duration" header="Initial duration"></Column>
      <Column field="duration" header="Elapsed time"></Column>
      <Column header="Status">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.is_completed" value="Completed" severity="success">Completed</Tag>
          <Tag v-if="slotProps.data.is_skipped" value="Skipped" severity="warn">Skipped</Tag>
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

<style scoped>

</style>