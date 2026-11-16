const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiValidationIssue {
  path: (string | number)[];
  message: string;
}

export class ApiError extends Error {
  status: number;
  details?: ApiValidationIssue[];

  constructor(message: string, status: number, details?: ApiValidationIssue[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface ApiFetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, ...init } = options;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Intenta nuevamente.', 0);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error || 'Ocurrió un error inesperado';
    throw new ApiError(message, response.status, body?.details);
  }

  return body as T;
}

/**
 * Para respuestas binarias (US-037: el zip con los dos documentos), donde
 * `apiFetch` no sirve porque siempre intenta parsear JSON. Los rechazos del
 * backend igual vienen en JSON (ej. 409 si falta generar un documento), asi
 * que el error se lee como JSON y el exito como blob.
 */
export async function apiFetchBlob(path: string, options: ApiFetchOptions = {}): Promise<Blob> {
  const { token, ...init } = options;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Intenta nuevamente.', 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error || 'Ocurrió un error inesperado', response.status, body?.details);
  }

  return response.blob();
}
