import type {
  BlockingQuestion,
  Inconsistency,
  ReviewSummary,
  StageKey,
} from '../../../types/review';
import { Badge, type BadgeTone } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Alert } from '../../../components/Alert';

const STAGE_ORDER: StageKey[] = ['definition', 'dataModel', 'apiSpec', 'screens', 'architecture', 'testing'];

const STAGE_LABELS: Record<StageKey, string> = {
  definition: 'Definición del producto',
  dataModel: 'Modelo de datos',
  apiSpec: 'Especificación de API',
  screens: 'Mapa de pantallas',
  architecture: 'Arquitectura',
  testing: 'Pruebas',
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

// Un hallazgo sin `status` viene de una respuesta vieja del backend: se
// trata como error, que es como se comportaba antes de que existieran los
// estados.
function isBlocking(issue: Inconsistency): boolean {
  return issue.status !== 'advertencia';
}

function stagesWithFindings(inconsistencies: Inconsistency[], predicate: (issue: Inconsistency) => boolean): Set<StageKey> {
  const set = new Set<StageKey>();
  inconsistencies.filter(predicate).forEach((issue) => {
    issue.stages.forEach((stage) => {
      const key = RULE_STAGE_TO_KEY[stage];
      if (key) set.add(key);
    });
  });
  return set;
}

// Todos los conflictos que afectan una etapa, con el id de regla ("data-model",
// no "dataModel") que les corresponde a ESA etapa - lo necesita
// buildCombinedConflictInstruction para redactar la instruccion en el lugar
// correcto (ver conflictInstructions.ts: el mensaje cambia segun se vaya a
// Definicion o a la etapa que todavia no refleja el conflicto).
function issuesForStage(inconsistencies: Inconsistency[], stageKey: StageKey): { issue: Inconsistency; ruleStage: string }[] {
  const result: { issue: Inconsistency; ruleStage: string }[] = [];
  inconsistencies.forEach((issue) => {
    issue.stages.forEach((ruleStage) => {
      if (RULE_STAGE_TO_KEY[ruleStage] === stageKey) result.push({ issue, ruleStage });
    });
  });
  return result;
}

type StageVisualStatus = 'complete' | 'pending' | 'warning' | 'conflict';

/**
 * Regla A/D de la revision transversal: una etapa sin generar es
 * "pendiente de generar" (estado neutro), nunca un conflicto. Y una
 * advertencia es distinta de un error: no bloquea la generacion final.
 * El orden importa: primero lo que falta generar, despues el estado de
 * consistencia de lo que SI existe.
 */
function statusFor(
  stageKey: StageKey,
  complete: boolean,
  conflicted: Set<StageKey>,
  warned: Set<StageKey>,
): StageVisualStatus {
  if (!complete) return 'pending';
  if (conflicted.has(stageKey)) return 'conflict';
  if (warned.has(stageKey)) return 'warning';
  return 'complete';
}

const STATUS_BADGE: Record<StageVisualStatus, { label: string; tone: BadgeTone }> = {
  complete: { label: 'Completo', tone: 'success' },
  pending: { label: 'Pendiente de generar', tone: 'neutral' },
  warning: { label: 'Con aviso', tone: 'warning' },
  conflict: { label: 'Con conflicto', tone: 'danger' },
};

interface Props {
  stages: ReviewSummary['stages'];
  inconsistencies: Inconsistency[];
  blockingQuestions: BlockingQuestion[];
  onNavigateToStage: (stage: StageKey) => void;
  /** Navegar a resolver UN conflicto puntual: la etapa destino abre con el chat ya cargado con como solucionarlo. */
  onNavigateToConflict: (stage: StageKey, issue: Inconsistency, ruleStage: string) => void;
  /** Boton "Resolver" de la etapa: combina TODOS los conflictos de esa etapa en una sola instruccion. */
  onResolveStage: (stage: StageKey, issues: { issue: Inconsistency; ruleStage: string }[]) => void;
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
  onNavigateToConflict,
  onResolveStage,
  readyToGenerate,
  onGenerateClick,
  isGenerating,
}: Props) {
  const conflicted = stagesWithFindings(inconsistencies, isBlocking);
  const warned = stagesWithFindings(inconsistencies, (issue) => !isBlocking(issue));
  const pendingStageLabels = STAGE_ORDER.filter((stageKey) => !stages[stageKey]?.complete).map(
    (stageKey) => STAGE_LABELS[stageKey]
  );

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-outline-variant/30 rounded-card border border-outline-variant/30 bg-surface-container-low">
        {STAGE_ORDER.map((stageKey) => {
          const status = statusFor(stageKey, stages[stageKey]?.complete ?? false, conflicted, warned);
          const badge = STATUS_BADGE[status];
          const stageIssues =
            status === 'conflict' || status === 'warning' ? issuesForStage(inconsistencies, stageKey) : [];
          return (
            <li key={stageKey} className="flex items-center gap-2 p-3 hover:bg-surface-container-high">
              <button
                type="button"
                onClick={() => onNavigateToStage(stageKey)}
                className="flex flex-1 items-center justify-between gap-3 text-left"
              >
                <span className="text-body-sm font-medium text-on-surface">
                  {STAGE_LABELS[stageKey]}
                </span>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </button>
              {stageIssues.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolveStage(stageKey, stageIssues);
                  }}
                  className="shrink-0"
                >
                  Resolver
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {blockingQuestions.length > 0 && (
        <Alert tone="warning">
          <h3 className="font-semibold">Preguntas bloqueantes sin resolver</h3>
          <ul className="mt-1 space-y-1">
            {blockingQuestions.map((question) => (
              <li key={question.id}>{question.question}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Errores y avisos van separados: un aviso no bloquea la generacion
          final, y mezclarlos hacia que todo pareciera igual de grave. */}
      {([
        { tone: 'danger' as const, title: 'Inconsistencias entre etapas', items: inconsistencies.filter(isBlocking) },
        {
          tone: 'warning' as const,
          title: 'Avisos de consistencia (no bloquean la generación)',
          items: inconsistencies.filter((issue) => !isBlocking(issue)),
        },
      ]).map(
        (group) =>
          group.items.length > 0 && (
            <Alert key={group.tone} tone={group.tone}>
              <h3 className="font-semibold">{group.title}</h3>
              <ul className="mt-1 space-y-2">
                {group.items.map((issue, i) => (
                  <li key={issue.id ?? i}>
                    <p>{issue.message}</p>
                    {issue.suggestion && (
                      <p className="mt-0.5 text-label-sm text-on-surface-variant">{issue.suggestion}</p>
                    )}
                    <div className="mt-1 flex gap-2">
                      {issue.stages.map((stage) => {
                        const key = RULE_STAGE_TO_KEY[stage];
                        if (!key) return null;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => onNavigateToConflict(key, issue, stage)}
                            className="text-label-sm font-medium underline hover:no-underline"
                          >
                            Ir a {STAGE_LABELS[key]} a resolverlo
                          </button>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </Alert>
          )
      )}

      {/* Regla A: si falta generar una etapa, decir CUAL falta en vez de
          dejar el boton deshabilitado sin explicacion. */}
      {!readyToGenerate && pendingStageLabels.length > 0 && (
        <p className="text-body-sm text-on-surface-variant">
          Todavía falta generar: {pendingStageLabels.join(', ')}.
        </p>
      )}

      <Button onClick={onGenerateClick} disabled={!readyToGenerate} loading={isGenerating}>
        Generar documentación final
      </Button>
    </div>
  );
}
