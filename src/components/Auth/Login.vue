<script setup lang="ts">
import { ref } from 'vue';
import { authService } from '../../services/supabaseService';

const emit = defineEmits<{
  (e: 'login', email: string, password: string): void;
  (e: 'go-to-signup'): void;
}>();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const { data, error } = await authService.signIn(email.value, password.value);

    if (error) {
      errorMessage.value = error.message || 'Login failed. Please try again.';
    } else {
      emit('login', email.value, password.value);
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred';
  } finally {
    isLoading.value = false;
  }
};

const goToSignup = () => {
  emit('go-to-signup');
};
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>

    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          type="email" 
          v-model="email" 
          placeholder="Enter your email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          type="password" 
          v-model="password" 
          placeholder="Enter your password"
          required
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <button 
        type="submit" 
        class="login-button"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <div class="signup-link">
      Don't have an account? 
      <button @click="goToSignup" class="text-button">Sign up</button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.login-button {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #3a5a8c;
}

.login-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.signup-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.text-button {
  background: none;
  border: none;
  color: #4a6fa5;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  text-decoration: underline;
}

.text-button:hover {
  color: #3a5a8c;
}
</style>
