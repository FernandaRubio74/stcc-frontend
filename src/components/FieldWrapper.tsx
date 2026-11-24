/**
 * Piezas compartidas entre Input/Textarea/Select: calculo de
 * aria-describedby y el renderizado de ayuda/error, para que los tres
 * componentes se comporten igual en vez de cada uno improvisando su propio
 * wiring de accesibilidad.
 */
export function describedByFor(id: string, help?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (help) return `${id}-help`;
  return undefined;
}

interface FieldLabelProps {
  id: string;
  label: string;
  required?: boolean;
  /** El campo sigue teniendo nombre accesible, solo no se ve (ej. una fila
   * compacta tipo tabla donde el contexto ya deja claro que es). */
  hideLabel?: boolean;
}

export function FieldLabel({ id, label, required, hideLabel }: FieldLabelProps) {
  return (
    <label
      htmlFor={id}
      className={hideLabel ? 'sr-only' : 'block text-body-sm font-medium text-on-surface-variant'}
    >
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  );
}

interface FieldMessageProps {
  id: string;
  help?: string;
  error?: string;
}

export function FieldMessage({ id, help, error }: FieldMessageProps) {
  if (error) {
    return (
      <p id={`${id}-error`} role="alert" className="text-body-sm text-danger">
        {error}
      </p>
    );
  }
  if (help) {
    return (
      <p id={`${id}-help`} className="text-body-sm text-on-surface-variant">
        {help}
      </p>
    );
  }
  return null;
}

export const FIELD_CONTROL_CLASSES =
  'block w-full rounded-control border bg-surface-container-lowest px-space-md py-space-sm text-body-sm text-on-surface shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-outline';

export function fieldBorderClasses(hasError: boolean): string {
  return hasError ? 'border-danger/60 focus:border-danger' : 'border-outline-variant focus:border-primary';
}
