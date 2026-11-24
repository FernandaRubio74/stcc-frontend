import type { ArchitectureScenario, ArchitectureState } from '../../../types/architecture';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/icons';

interface Props {
  catalog: ArchitectureScenario[];
  state: ArchitectureState;
  canSelect: boolean;
  onSelect: (architectureId: string) => void;
  isSelecting: boolean;
}

// Ver DESIGN.md: cada tarjeta de arquitectura muestra sus piezas tecnicas
// como chips de codigo (persistencia/backend/frontend/infra/operacion), no
// como una lista de definiciones - se omiten las metricas inventadas del
// mockup (score %, costo mensual, radar de decision, diagrama de
// despliegue, .env autogenerado) porque no son datos que el backend calcula.
function TechChips({ scenario }: { scenario: ArchitectureScenario }) {
  const items = [
    scenario.backend,
    scenario.frontend,
    scenario.persistence,
    scenario.infrastructure,
    scenario.operation,
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((item, i) => (
        <span key={i} className="rounded bg-surface-container-high px-space-sm py-1 font-mono text-code-sm text-on-surface">
          {item}
        </span>
      ))}
    </div>
  );
}

// US-028/US-030: vista comparativa de las 5 arquitecturas del catalogo,
// con la recomendacion de la IA resaltada y su justificacion, y un boton
// de confirmacion que persiste la decision via API (T-030.3).
export function ArchitectureSelector({ catalog, state, canSelect, onSelect, isSelecting }: Props) {
  return (
    <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
      {catalog.map((scenario) => {
        const isRecommended = scenario.id === state.recommendedId;
        const isSelected = scenario.id === state.selectedId;

        return (
          <article
            key={scenario.id}
            data-testid={`architecture-card-${scenario.id}`}
            className={`flex flex-col gap-space-md rounded-xl p-space-xl shadow-sm transition-all ${
              isSelected
                ? 'bg-surface-container shadow-xl ring-2 ring-primary/40'
                : isRecommended
                  ? 'bg-surface-container shadow-lg ring-1 ring-primary/20'
                  : 'bg-surface-container-low hover:bg-surface-container'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex flex-wrap items-center gap-space-sm">
                  {isRecommended && (
                    <span className="flex items-center gap-1 rounded bg-primary-container px-2.5 py-1 text-label-sm text-on-primary-container shadow-sm">
                      <Icon name="auto_awesome" className="text-[14px]" />
                      Recomendada
                    </span>
                  )}
                  {isSelected && (
                    <span className="flex items-center gap-1 rounded bg-tertiary-container px-2.5 py-1 text-label-sm text-on-tertiary-container shadow-sm">
                      <Icon name="check" className="text-[14px]" />
                      Confirmada
                    </span>
                  )}
                </div>
                <h3 className="text-headline-lg font-semibold text-on-surface">{scenario.name}</h3>
              </div>
              {isSelected && <Icon name="check_circle" className="text-[28px] text-tertiary" filled />}
            </div>

            <p className="text-body-md leading-relaxed text-on-surface-variant">{scenario.summary}</p>

            {isRecommended && state.justification && (
              <p className="rounded-control bg-primary-container/15 p-space-sm text-label-md text-on-surface">
                {state.justification}
              </p>
            )}

            <TechChips scenario={scenario} />

            {canSelect && !isSelected && (
              <Button
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => onSelect(scenario.id)}
                loading={isSelecting}
              >
                {isRecommended ? 'Aceptar recomendación' : 'Elegir esta opción'}
              </Button>
            )}
          </article>
        );
      })}
    </div>
  );
}
