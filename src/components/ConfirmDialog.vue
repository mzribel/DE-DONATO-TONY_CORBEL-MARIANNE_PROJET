<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";


const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}>();

const props = defineProps<{
  title?: string
  message?: string
  confirmButton?: string
  cancelButton?: string,
  modelValue: boolean
}>()
const isVisible = ref(props.modelValue);

// Observers des changements des props
watch(() => props.modelValue, (val) => {
  isVisible.value = val;
});
watch(isVisible, (val) => {
  emit('update:modelValue', val);
});

// Actions
function onConfirm() {
  emit("confirm");
  isVisible.value = false;
}
function onCancel() {
  isVisible.value = false;
}
</script>

<template>
  <Dialog v-model:visible="isVisible" modal header="Confirm">
    <template #header>
      <h2>{{ props.title || "Confirmation" }}</h2>
    </template>
    <div>
      {{ props.message || 'Are you sure you want to continue?' }}
    </div>
    <template #footer>
      <Button type="button" label="Cancel" severity="secondary" size="medium" @click="onCancel" />
      <Button type="button" label="Confirm" severity="danger" size="medium" @click="onConfirm" />
    </template>
  </Dialog>
</template>
