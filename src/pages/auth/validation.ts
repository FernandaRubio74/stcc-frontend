const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El email es requerido';
  if (!EMAIL_REGEX.test(email)) return 'Ingresa un email válido';
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `${label} es requerido`;
}

export function validatePassword(password: string, minLength = 1): string | null {
  if (!password) return 'La contraseña es requerida';
  if (password.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres`;
  }
  return null;
}
