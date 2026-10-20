import type { BlockingQuestion, Inconsistency, ReviewSummary, StageKey } from '../../../types/review';

const STAGE_ORDER: StageKey[] = ['definition', 'dataModel', 'apiSpec', 'screens', 'architecture'];

const STAGE_LABELS: Record<StageKey, string> = {
  definition: 'Definición del producto',
  dataModel: 'Modelo de datos',
  apiSpec: 'Especificación de API',
  screens: 'Mapa de pantallas',
  architecture: 'Arquitectura',
};

// Los ids de etapa que usa el motor de consistencia (US-031) son kebab-case
// y no incluyen "architecture" (ninguna regla la referencia hoy); este mapa
// traduce esos ids a las claves de `stages` que usa esta pantalla.
const RULE_STAGE_TO_KEY: Record<string, StageKey> = {
  definition: 'definition',
  'data-model': 'dataModel',
  'api-spec': 'apiSpec',
  screens: 'screens',
};

function stagesInConflict(inconsistencies: Inconsistency[]): Set<StageKey> {
  const set = new Set<StageKey>();
  inconsistencies.forEach((issue) => {
    issue.stages.forEach((stage) => {
      const key = RULE_STAGE_TO_KEY[stage];
      if (key) set.add(key);
    });
  });
  return set;
}

type StageVisualStatus = 'complete' | 'pending' | 'conflict';

function statusFor(stageKey: StageKey, complete: boolean, conflicted: Set<StageKey>): StageVisualStatus {
  if (conflicted.has(stageKey)) return 'conflict';
  return complete ? 'complete' : 'pending';
}

const STATUS_BADGE: Record<StageVisualStatus, { label: string; className: string }> = {
  complete: { label: '✅ Completo', className: 'bg-green-100 text-green-700' },
  pending: { label: '⏳ Pendiente', className: 'bg-gray-100 text-gray-600' },
  conflict: { label: '⚠️ Con conflicto', className: 'bg-red-100 text-red-700' },
};

interface Props {
  stages: ReviewSummary['stages'];
  inconsistencies: Inconsistency[];
  blockingQuestions: BlockingQuestion[];
  onNavigateToStage: (stage: StageKey) => void;
  readyToGenerate: boolean;
  onGenerateClick: () => void;
  isGenerating: boolean;
}

// US-033: checklist por etapa con estado visual (T-033.1) donde cada item
// (y cada conflicto/bloqueo listado abajo) es clickeable y navega
// directamente a la etapa correspondiente (T-033.2). El boton de
// generacion final vive aca (no en la pagina contenedora) para que su
// habilitacion condicional (T-033.3: deshabilitado mientras haya bloqueos
// o inconsistencias) se pueda testear igual que el resto del componente.
export function ReviewChecklist({
  stages,
  inconsistencies,
  blockingQuestions,
  onNavigateToStage,
  readyToGenerate,
  onGenerateClick,
  isGenerating,
}: Props) {
  const conflicted = stagesInConflict(inconsistencies);

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
        {STAGE_ORDER.map((stageKey) => {
          const status = statusFor(stageKey, stages[stageKey]?.complete ?? false, conflicted);
          const badge = STATUS_BADGE[status];
          return (
            <li key={stageKey}>
              <button
                type="button"
                onClick={() => onNavigateToStage(stageKey)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">{STAGE_LABELS[stageKey]}</span>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {blockingQuestions.length > 0 && (
        <section className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Preguntas bloqueantes sin resolver</h3>
          <ul className="space-y-1">
            {blockingQuestions.map((question) => (
              <li key={question.id} className="text-sm text-amber-800">
                {question.question}
              </li>
            ))}
          </ul>
        </section>
      )}

      {inconsistencies.length > 0 && (
        <section className="space-y-2 rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Inconsistencias entre etapas</h3>
          <ul className="space-y-2">
            {inconsistencies.map((issue, i) => (
              <li key={i} className="text-sm text-red-800">
                <p>{issue.message}</p>
                <div className="mt-1 flex gap-2">
                  {issue.stages.map((stage) => {
                    const key = RULE_STAGE_TO_KEY[stage];
                    if (!key) return null;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => onNavigateToStage(key)}
                        className="text-xs font-medium text-red-700 underline hover:text-red-900"
                      >
                        Ir a {STAGE_LABELS[key]}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={onGenerateClick}
        disabled={!readyToGenerate || isGenerating}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? 'Generando…' : 'Generar documentación final'}
      </button>
    </div>
  );
}
