<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

const props = defineProps<{ modelValue: boolean }>();
const isVisible = ref(props.modelValue);
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}>();

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
    <div class="dialog-content">
      <span>Are you sure you want to proceed?</span>
      <div class="button-group">
        <Button type="button" label="Cancel" severity="secondary" size="medium" @click="onCancel" />
        <Button type="button" label="Confirm" severity="danger" size="medium" @click="onConfirm" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
</style>
