import { ref } from 'vue';

export function useAuthForm() {
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    const reset = () => {
        email.value = '';
        password.value = '';
        confirmPassword.value = '';
        errorMessage.value = '';
        successMessage.value = '';
        isLoading.value = false;
    };

    return {
        email,
        password,
        confirmPassword,
        errorMessage,
        successMessage,
        isLoading,
        reset
    };
}
