import type { SelectHTMLAttributes } from 'react';
import {
  describedByFor,
  FieldLabel,
  FieldMessage,
  FIELD_CONTROL_CLASSES,
  fieldBorderClasses,
} from './FieldWrapper';
import { ChevronDownIcon } from './icons';

interface Option {
  value: string;
  label: string;
}

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string;
  label: string;
  options: Option[];
  help?: string;
  error?: string;
  hideLabel?: boolean;
}

export function Select({
  id,
  label,
  options,
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
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${FIELD_CONTROL_CLASSES} ${fieldBorderClasses(Boolean(error))} appearance-none pr-10 ${className}`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-on-surface-variant" />
      </div>
      <FieldMessage id={id} help={help} error={error} />
    </div>
  );
}
