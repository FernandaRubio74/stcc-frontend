import { useState, type InputHTMLAttributes } from 'react';
import {
  describedByFor,
  FieldLabel,
  FieldMessage,
  FIELD_CONTROL_CLASSES,
  fieldBorderClasses,
} from './FieldWrapper';
import { EyeIcon, EyeOffIcon } from './icons';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  help?: string;
  error?: string;
  hideLabel?: boolean;
}

// Campo de texto comun del sistema de diseno. Cuando type="password" agrega
// el boton de mostrar/ocultar clave (antes no existia en ningun formulario
// de auth), siempre accesible por teclado y con su propio aria-label.
export function Input({
  id,
  label,
  help,
  error,
  required,
  hideLabel,
  type = 'text',
  className = '',
  ...rest
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const describedBy = describedByFor(id, help, error);

  return (
    <div className="space-y-1">
      <FieldLabel id={id} label={label} required={required} hideLabel={hideLabel} />
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${FIELD_CONTROL_CLASSES} ${fieldBorderClasses(Boolean(error))} ${isPassword ? 'pr-10' : ''} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            {revealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        )}
      </div>
      <FieldMessage id={id} help={help} error={error} />
    </div>
  );
}
