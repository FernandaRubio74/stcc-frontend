import { useState, type FormEvent } from 'react';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';

const MAX_NAME_LENGTH = 150;

export interface NewProjectFormValues {
  name: string;
  description?: string;
}

interface Props {
  onSubmit: (values: NewProjectFormValues) => void;
  isSubmitting: boolean;
  formError: string | null;
}

// STCC-67: formulario de creacion de proyecto (US-043: ahora vive dentro de
// un Modal en vez de ser su propia pagina - crear un proyecto es una accion
// corta que no necesita abandonar "Mis proyectos").
export function NewProjectForm({ onSubmit, isSubmitting, formError }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setFieldError('El nombre es requerido');
      return;
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      setFieldError('El nombre es demasiado largo');
      return;
    }

    setFieldError(null);
    onSubmit({ name: name.trim(), description: description.trim() || undefined });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && <Alert>{formError}</Alert>}

      <Input
        id="project-name"
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldError ?? undefined}
        required
      />

      <Textarea
        id="project-description"
        label="Descripción"
        help="Opcional"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Crear proyecto
      </Button>
    </form>
  );
}
