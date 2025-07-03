<script setup lang="ts">
import { ref } from 'vue';
import { authService } from '../../services/supabaseService';

const emit = defineEmits<{
  (e: 'signup', email: string, password: string): void;
  (e: 'go-to-login'): void;
}>();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long';
    return;
  }

  isLoading.value = true;

  try {
    const { data, error } = await authService.signUp(email.value, password.value);

    if (error) {
      errorMessage.value = error.message || 'Signup failed. Please try again.';
    } else {
      if (data.user && !data.session) {
        successMessage.value = 'Check your email for confirmation link';
      }


      email.value = '';
      password.value = '';
      confirmPassword.value = '';
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred';
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  emit('go-to-login');
};
</script>

<template>
  <div class="signup-container">
    <h2>Create Account</h2>

    <form @submit.prevent="handleSubmit" class="signup-form">
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
          placeholder="Create a password"
          required
        />
      </div>

      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input 
          id="confirm-password"
          type="password" 
          v-model="confirmPassword" 
          placeholder="Confirm your password"
          required
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <button 
        type="submit" 
        class="signup-button"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Creating account...' : 'Sign Up' }}
      </button>
    </form>

    <div class="login-link">
      Already have an account? 
      <button @click="goToLogin" class="text-button">Log in</button>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
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

.signup-form {
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

.signup-button {
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

.signup-button:hover {
  background-color: #3a5a8c;
}

.signup-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #2ecc71;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.login-link {
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
