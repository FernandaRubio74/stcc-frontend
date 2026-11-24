import { useState, type ChangeEvent, type FormEvent } from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { validateEmail, validatePassword, validateRequired } from './validation';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';

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

export function RegisterForm({
  onSubmit,
  isSubmitting,
  formError,
  onGoogleClick,
}: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormValues>({
    fullName: '',
    email: '',
    password: '',
  });
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
      {formError && <Alert>{formError}</Alert>}

      <Input
        id="register-fullName"
        name="fullName"
        type="text"
        label="Nombre completo"
        autoComplete="name"
        value={values.fullName}
        onChange={handleChange('fullName')}
        error={fieldErrors.fullName}
      />

      <Input
        id="register-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        value={values.email}
        onChange={handleChange('email')}
        error={fieldErrors.email}
      />

      <Input
        id="register-password"
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="new-password"
        value={values.password}
        onChange={handleChange('password')}
        error={fieldErrors.password}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Crear cuenta
      </Button>

      <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant/40" />
        o
        <span className="h-px flex-1 bg-outline-variant/40" />
      </div>

      <GoogleAuthButton onClick={onGoogleClick} label="Registrarte con Google" />
    </form>
  );
}
