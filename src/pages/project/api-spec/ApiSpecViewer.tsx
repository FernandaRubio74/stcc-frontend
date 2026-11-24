import { useState } from 'react';
import type {
  Endpoint,
  EndpointParameter,
  EndpointResponse,
  HttpMethod,
} from '../../../types/apiSpec';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const PARAM_LOCATIONS: EndpointParameter['in'][] = ['path', 'query', 'body'];

// Ver DESIGN.md "Chips & Technical Badges": un color estable por metodo
// HTTP (GET=secondary/cian, POST=primary/indigo, DELETE=error/rosa).
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-secondary-container/20 text-secondary',
  POST: 'bg-primary-container/30 text-primary',
  PUT: 'bg-warning-container/30 text-warning',
  PATCH: 'bg-warning-container/30 text-warning',
  DELETE: 'bg-danger-container/30 text-danger',
};

function groupByResource(endpoints: Endpoint[]): Array<[string, number[]]> {
  const order: string[] = [];
  const indexesByResource = new Map<string, number[]>();

  endpoints.forEach((endpoint, index) => {
    const key = endpoint.resourceEntity || '(sin entidad)';
    if (!indexesByResource.has(key)) {
      indexesByResource.set(key, []);
      order.push(key);
    }
    indexesByResource.get(key)!.push(index);
  });

  return order.map((key) => [key, indexesByResource.get(key)!]);
}

interface Props {
  endpoints: Endpoint[];
  onChange: (endpoints: Endpoint[]) => void;
  disabled: boolean;
}

// US-025: lista los endpoints agrupados por entidad (T-025.1), con detalle
// expandible por endpoint (T-025.2) y edicion inline conectada a US-024
// (T-025.3) — el padre (ApiSpecPage) es quien distingue visualmente los
// cambios no aprobados, comparando draft vs approved.
export function ApiSpecViewer({ endpoints, onChange, disabled }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggleExpanded(index: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function updateEndpoint(index: number, patch: Partial<Endpoint>) {
    onChange(endpoints.map((endpoint, i) => (i === index ? { ...endpoint, ...patch } : endpoint)));
  }

  function removeEndpoint(index: number) {
    onChange(endpoints.filter((_, i) => i !== index));
  }

  function addEndpoint() {
    onChange([
      ...endpoints,
      {
        method: 'GET',
        path: '',
        description: '',
        resourceEntity: '',
        parameters: [],
        responses: [{ status: 200, description: 'ok' }],
      },
    ]);
  }

  function updateParameter(
    endpointIndex: number,
    paramIndex: number,
    patch: Partial<EndpointParameter>,
  ) {
    const parameters = endpoints[endpointIndex].parameters.map((param, i) =>
      i === paramIndex ? { ...param, ...patch } : param,
    );
    updateEndpoint(endpointIndex, { parameters });
  }

  function addParameter(endpointIndex: number) {
    updateEndpoint(endpointIndex, {
      parameters: [
        ...endpoints[endpointIndex].parameters,
        { name: '', in: 'query', type: 'string', required: true, description: '' },
      ],
    });
  }

  function removeParameter(endpointIndex: number, paramIndex: number) {
    updateEndpoint(endpointIndex, {
      parameters: endpoints[endpointIndex].parameters.filter((_, i) => i !== paramIndex),
    });
  }

  function updateResponse(
    endpointIndex: number,
    responseIndex: number,
    patch: Partial<EndpointResponse>,
  ) {
    const responses = endpoints[endpointIndex].responses.map((response, i) =>
      i === responseIndex ? { ...response, ...patch } : response,
    );
    updateEndpoint(endpointIndex, { responses });
  }

  function addResponse(endpointIndex: number) {
    updateEndpoint(endpointIndex, {
      responses: [...endpoints[endpointIndex].responses, { status: 200, description: '' }],
    });
  }

  function removeResponse(endpointIndex: number, responseIndex: number) {
    updateEndpoint(endpointIndex, {
      responses: endpoints[endpointIndex].responses.filter((_, i) => i !== responseIndex),
    });
  }

  const groups = groupByResource(endpoints);

  return (
    <div className="space-y-6">
      {groups.map(([resource, indexes]) => (
        // key = primer indice del grupo (no el nombre del recurso): si se
        // edita "Entidad del modelo de datos" en vivo, el texto del grupo
        // cambia en cada tecla, y usarlo como key forzaria a React a
        // desmontar y remontar todo el subarbol, perdiendo el foco del input.
        <div key={indexes[0]} className="space-y-2">
          <h3 className="text-label-md font-semibold uppercase tracking-wide text-outline">
            {resource}
          </h3>
          <ul className="divide-y divide-outline-variant/30 rounded-control border border-outline-variant/30 bg-surface-container-low">
            {indexes.map((index) => {
              const endpoint = endpoints[index];
              const isExpanded = expanded.has(index);
              return (
                <li key={index} className="p-3">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    aria-expanded={isExpanded}
                    aria-label={`${endpoint.method} ${endpoint.path || '(sin ruta)'}`}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold ${METHOD_COLORS[endpoint.method]}`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-body-sm text-on-surface">
                      {endpoint.path || '(sin ruta)'}
                    </span>
                    <span className="flex flex-wrap justify-end gap-1">
                      {endpoint.responses.map((response, i) => (
                        <span
                          key={i}
                          className="rounded bg-surface-container-highest px-1.5 py-0.5 text-label-sm text-on-surface-variant"
                        >
                          {response.status}
                        </span>
                      ))}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 border-t border-outline-variant/20 pt-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="text-label-sm text-outline">
                          Metodo
                          <select
                            value={endpoint.method}
                            onChange={(e) =>
                              updateEndpoint(index, { method: e.target.value as HttpMethod })
                            }
                            disabled={disabled}
                            className="mt-1 block w-full rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                          >
                            {METHODS.map((method) => (
                              <option key={method} value={method}>
                                {method}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-label-sm text-outline">
                          Ruta
                          <input
                            value={endpoint.path}
                            onChange={(e) => updateEndpoint(index, { path: e.target.value })}
                            disabled={disabled}
                            className="mt-1 block w-full rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 font-mono text-body-sm text-on-surface disabled:bg-surface-container"
                          />
                        </label>
                        <label className="text-label-sm text-outline sm:col-span-2">
                          Descripcion
                          <input
                            value={endpoint.description}
                            onChange={(e) => updateEndpoint(index, { description: e.target.value })}
                            disabled={disabled}
                            className="mt-1 block w-full rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                          />
                        </label>
                        <label className="text-label-sm text-outline sm:col-span-2">
                          Entidad del modelo de datos
                          <input
                            value={endpoint.resourceEntity}
                            onChange={(e) =>
                              updateEndpoint(index, { resourceEntity: e.target.value })
                            }
                            disabled={disabled}
                            className="mt-1 block w-full rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <p className="text-label-sm font-semibold text-outline">Parametros</p>
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex flex-wrap items-center gap-2">
                            <input
                              value={param.name}
                              onChange={(e) =>
                                updateParameter(index, paramIndex, { name: e.target.value })
                              }
                              disabled={disabled}
                              placeholder="nombre"
                              aria-label={`parametro ${paramIndex + 1} nombre`}
                              className="w-28 rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                            />
                            <select
                              value={param.in}
                              onChange={(e) =>
                                updateParameter(index, paramIndex, {
                                  in: e.target.value as EndpointParameter['in'],
                                })
                              }
                              disabled={disabled}
                              className="rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                            >
                              {PARAM_LOCATIONS.map((loc) => (
                                <option key={loc} value={loc}>
                                  {loc}
                                </option>
                              ))}
                            </select>
                            <input
                              value={param.type}
                              onChange={(e) =>
                                updateParameter(index, paramIndex, { type: e.target.value })
                              }
                              disabled={disabled}
                              placeholder="tipo"
                              aria-label={`parametro ${paramIndex + 1} tipo`}
                              className="w-20 rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                            />
                            <label className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                              <input
                                type="checkbox"
                                checked={param.required}
                                onChange={(e) =>
                                  updateParameter(index, paramIndex, { required: e.target.checked })
                                }
                                disabled={disabled}
                              />
                              requerido
                            </label>
                            <input
                              value={param.description}
                              onChange={(e) =>
                                updateParameter(index, paramIndex, { description: e.target.value })
                              }
                              disabled={disabled}
                              placeholder="descripcion"
                              aria-label={`parametro ${paramIndex + 1} descripcion`}
                              className="min-w-[8rem] flex-1 rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                            />
                            {!disabled && (
                              <button
                                type="button"
                                onClick={() => removeParameter(index, paramIndex)}
                                aria-label={`Quitar parametro ${paramIndex + 1}`}
                                className="text-label-sm text-danger hover:underline"
                              >
                                Quitar
                              </button>
                            )}
                          </div>
                        ))}
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => addParameter(index)}
                            className="text-label-sm font-medium text-primary hover:underline"
                          >
                            + Agregar parametro
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-label-sm font-semibold text-outline">Respuestas</p>
                        {endpoint.responses.map((response, responseIndex) => (
                          <div key={responseIndex} className="flex flex-wrap items-center gap-2">
                            <input
                              type="number"
                              value={response.status}
                              onChange={(e) =>
                                updateResponse(index, responseIndex, {
                                  status: Number(e.target.value),
                                })
                              }
                              disabled={disabled}
                              aria-label={`respuesta ${responseIndex + 1} status`}
                              className="w-20 rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                            />
                            <input
                              value={response.description}
                              onChange={(e) =>
                                updateResponse(index, responseIndex, {
                                  description: e.target.value,
                                })
                              }
                              disabled={disabled}
                              placeholder="descripcion"
                              aria-label={`respuesta ${responseIndex + 1} descripcion`}
                              className="min-w-[10rem] flex-1 rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm text-on-surface disabled:bg-surface-container"
                            />
                            {!disabled && (
                              <button
                                type="button"
                                onClick={() => removeResponse(index, responseIndex)}
                                aria-label={`Quitar respuesta ${responseIndex + 1}`}
                                className="text-label-sm text-danger hover:underline"
                              >
                                Quitar
                              </button>
                            )}
                          </div>
                        ))}
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => addResponse(index)}
                            className="text-label-sm font-medium text-primary hover:underline"
                          >
                            + Agregar respuesta
                          </button>
                        )}
                      </div>

                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => removeEndpoint(index)}
                          className="text-label-sm font-medium text-danger hover:underline"
                        >
                          Eliminar endpoint
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={addEndpoint}
          className="text-body-sm font-medium text-primary hover:underline"
        >
          + Agregar endpoint
        </button>
      )}
    </div>
  );
}
