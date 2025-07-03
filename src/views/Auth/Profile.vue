<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '../../types';

const props = defineProps<{
  user: User | null;
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const userEmail = computed(() => props.user?.email || 'No email available');
const userId = computed(() => props.user?.id || 'Not logged in');
const createdAt = computed(() => {
  if (!props.user?.created_at) return 'Unknown';
  return new Date(props.user.created_at).toLocaleDateString();
});

const handleLogout = () => {
  emit('logout');
};
</script>

<template>
  <div class="profile-container">
    <h2>User Profile</h2>
    
    <div v-if="user" class="profile-info">
      <div class="info-group">
        <span class="label">Email:</span>
        <span class="value">{{ userEmail }}</span>
      </div>
      
      <div class="info-group">
        <span class="label">User ID:</span>
        <span class="value user-id">{{ userId }}</span>
      </div>
      
      <div class="info-group">
        <span class="label">Account Created:</span>
        <span class="value">{{ createdAt }}</span>
      </div>
      
      <button @click="handleLogout" class="logout-button">
        Log Out
      </button>
    </div>
    
    <div v-else class="not-logged-in">
      <p>You are not logged in.</p>
      <p>Please log in to view your profile.</p>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #666;
}

.value {
  font-size: 1.1rem;
}

.user-id {
  font-size: 0.9rem;
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-wrap: break-word;
}

.logout-button {
  margin-top: 2rem;
  padding: 0.75rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #c0392b;
}

.not-logged-in {
  text-align: center;
  color: #666;
  font-style: italic;
}
</style>