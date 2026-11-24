import { useState, type ChangeEvent, type FormEvent } from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { validateEmail, validatePassword } from './validation';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';

export interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
  onGoogleClick: () => void;
}

export function LoginForm({ onSubmit, isSubmitting, formError, onGoogleClick }: LoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormValues>>({});

  function handleChange(field: keyof LoginFormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function validate(): boolean {
    const errors: Partial<LoginFormValues> = {};
    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(values.password);
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
        id="login-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        value={values.email}
        onChange={handleChange('email')}
        error={fieldErrors.email}
      />

      <Input
        id="login-password"
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange('password')}
        error={fieldErrors.password}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Iniciar sesión
      </Button>

      <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant/40" />
        o
        <span className="h-px flex-1 bg-outline-variant/40" />
      </div>

      <GoogleAuthButton onClick={onGoogleClick} label="Iniciar sesión con Google" />
    </form>
  );
}
