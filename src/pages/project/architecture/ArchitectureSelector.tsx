import type { ArchitectureScenario, ArchitectureState } from '../../../types/architecture';

interface Props {
  catalog: ArchitectureScenario[];
  state: ArchitectureState;
  canSelect: boolean;
  onSelect: (architectureId: string) => void;
  isSelecting: boolean;
}

// US-028/US-030: vista comparativa de las 5 arquitecturas del catalogo,
// con la recomendacion de la IA resaltada y su justificacion, y un boton
// de confirmacion que persiste la decision via API (T-030.3).
export function ArchitectureSelector({ catalog, state, canSelect, onSelect, isSelecting }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {catalog.map((scenario) => {
        const isRecommended = scenario.id === state.recommendedId;
        const isSelected = scenario.id === state.selectedId;

        return (
          <div
            key={scenario.id}
            data-testid={`architecture-card-${scenario.id}`}
            className={`rounded-md border p-4 ${
              isSelected
                ? 'border-indigo-600 ring-2 ring-indigo-200'
                : isRecommended
                  ? 'border-indigo-300'
                  : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{scenario.name}</h3>
              <div className="flex flex-col items-end gap-1">
                {isRecommended && (
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    Recomendada
                  </span>
                )}
                {isSelected && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Confirmada
                  </span>
                )}
              </div>
            </div>

            <p className="mt-1 text-sm text-gray-600">{scenario.summary}</p>

            {isRecommended && state.justification && (
              <p className="mt-2 rounded bg-indigo-50 p-2 text-xs text-indigo-900">{state.justification}</p>
            )}

            <dl className="mt-3 space-y-1 text-xs text-gray-600">
              <div>
                <dt className="inline font-semibold">Persistencia: </dt>
                <dd className="inline">{scenario.persistence}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Backend: </dt>
                <dd className="inline">{scenario.backend}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Frontend: </dt>
                <dd className="inline">{scenario.frontend}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Infraestructura: </dt>
                <dd className="inline">{scenario.infrastructure}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Operación: </dt>
                <dd className="inline">{scenario.operation}</dd>
              </div>
            </dl>

            {canSelect && !isSelected && (
              <button
                type="button"
                onClick={() => onSelect(scenario.id)}
                disabled={isSelecting}
                className="mt-3 rounded-md border border-indigo-600 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRecommended ? 'Aceptar recomendación' : 'Elegir esta opción'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
