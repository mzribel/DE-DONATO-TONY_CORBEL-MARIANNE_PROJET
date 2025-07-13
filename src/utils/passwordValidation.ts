export function validatePasswordFields(password: string, confirmPassword?: string): string | null {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    if (confirmPassword !== undefined && password !== confirmPassword) return 'Passwords do not match';
    return null;
}