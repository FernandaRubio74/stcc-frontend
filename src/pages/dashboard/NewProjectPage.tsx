import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { createProject } from '../../services/projectsService';
import { ApiError } from '../../lib/apiClient';

const MAX_NAME_LENGTH = 150;

// STCC-67: formulario de creacion de proyecto.
export function NewProjectPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createProject(
        { name: name.trim(), description: description.trim() || undefined },
        token as string,
      ),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${project.id}`, { replace: true });
    },
    onError: (error: unknown) => {
      setFormError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFieldError('El nombre es requerido');
      return;
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      setFieldError('El nombre es demasiado largo');
      return;
    }

    setFieldError(null);
    mutation.mutate();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo proyecto</h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(fieldError)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
            {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError}</p>}
          </div>

          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? 'Creando…' : 'Crear proyecto'}
          </button>
        </form>

        <Link to="/dashboard" className="block text-center text-sm text-indigo-600 hover:underline">
          Volver
        </Link>
      </div>
    </div>
  );
}
