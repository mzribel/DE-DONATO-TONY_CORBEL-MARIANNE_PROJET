<script setup lang="ts">

const sendNotification = () => {
  window.electronAPI.notify('BONJOUR FDP', 'Faudra penser à trouver autre chose mdr');
};

</script>

<template>
  <h1>Home</h1>
  <div class="card">
    <button type="button" @click="sendNotification">Send a notification !</button>
    <p>Ctrl+maj+i pour ouvrir la console !</p>
  </div>
</template>

<style scoped>
</style>
