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
