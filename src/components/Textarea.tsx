import type { TextareaHTMLAttributes } from 'react';
import {
  describedByFor,
  FieldLabel,
  FieldMessage,
  FIELD_CONTROL_CLASSES,
  fieldBorderClasses,
} from './FieldWrapper';

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string;
  label: string;
  help?: string;
  error?: string;
  hideLabel?: boolean;
}

export function Textarea({
  id,
  label,
  help,
  error,
  required,
  hideLabel,
  className = '',
  ...rest
}: Props) {
  const describedBy = describedByFor(id, help, error);
  return (
    <div className="space-y-1">
      <FieldLabel id={id} label={label} required={required} hideLabel={hideLabel} />
      <textarea
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`${FIELD_CONTROL_CLASSES} ${fieldBorderClasses(Boolean(error))} ${className}`}
        {...rest}
      />
      <FieldMessage id={id} help={help} error={error} />
    </div>
  );
}
