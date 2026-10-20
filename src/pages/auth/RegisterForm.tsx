import { useState, type ChangeEvent, type FormEvent } from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { validateEmail, validatePassword, validateRequired } from './validation';

export interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
}

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void | Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
  onGoogleClick: () => void;
}

const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm({ onSubmit, isSubmitting, formError, onGoogleClick }: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormValues>({ fullName: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<RegisterFormValues>>({});

  function handleChange(field: keyof RegisterFormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function validate(): boolean {
    const errors: Partial<RegisterFormValues> = {};
    const fullNameError = validateRequired(values.fullName, 'El nombre');
    if (fullNameError) errors.fullName = fullNameError;
    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(values.password, MIN_PASSWORD_LENGTH);
    if (passwordError) errors.password = passwordError;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div>
        <label htmlFor="register-fullName" className="block text-sm font-medium text-gray-700">
          Nombre completo
        </label>
        <input
          id="register-fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={values.fullName}
          onChange={handleChange('fullName')}
          aria-invalid={Boolean(fieldErrors.fullName)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
        {fieldErrors.fullName && <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange('email')}
          aria-invalid={Boolean(fieldErrors.email)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
        {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange('password')}
          aria-invalid={Boolean(fieldErrors.password)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
        {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        o
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <GoogleAuthButton onClick={onGoogleClick} label="Registrarte con Google" />
    </form>
  );
}
