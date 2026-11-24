import type { Step } from '../../components/Stepper';
import type { ReviewSummary } from '../../types/review';

interface StageDef {
  id: string;
  label: string;
  to: string;
}

const STAGE_DEFS: StageDef[] = [
  { id: 'wizard', label: 'Definir producto', to: 'wizard' },
  { id: 'data-model', label: 'Modelo de datos', to: 'data-model' },
  { id: 'api-spec', label: 'Especificación de API', to: 'api-spec' },
  { id: 'screens', label: 'Mapa de pantallas', to: 'screens' },
  { id: 'architecture', label: 'Arquitectura', to: 'architecture' },
  { id: 'testing', label: 'Pruebas', to: 'testing' },
  { id: 'review', label: 'Revisión final', to: 'review' },
  { id: 'documents', label: 'Documentos finales', to: 'documents' },
];

// Mismo orden que las 6 etapas gateadas que devuelve getReviewSummary
// (review.service.js del backend) - "Pruebas" va despues de Arquitectura y
// antes de Revision final, igual que en STAGE_DEFS arriba.
const GATED_STAGE_KEYS: Array<keyof ReviewSummary['stages']> = [
  'definition',
  'dataModel',
  'apiSpec',
  'screens',
  'architecture',
  'testing',
];
const LAST_GATED_INDEX = GATED_STAGE_KEYS.length - 1;

const STAGE_ORDER = STAGE_DEFS.map((stage) => stage.id);

/**
 * Ruta de la etapa siguiente a `currentStageId`, o null si es la ultima.
 * Lo usa cada pagina de etapa para navegar automaticamente despues de
 * aprobar/avanzar/seleccionar (antes esas acciones no te llevaban a ningun
 * lado: habia que scrollear hasta el breadcrumb/stepper arriba y clickear
 * la etapa siguiente a mano).
 */
export function getNextStagePath(projectId: string, currentStageId: string): string | null {
  const index = STAGE_ORDER.indexOf(currentStageId);
  if (index === -1 || index === STAGE_ORDER.length - 1) return null;
  return `/projects/${projectId}/${STAGE_DEFS[index + 1].to}`;
}

export interface NextStage {
  id: string;
  label: string;
  to: string;
  /** true si el proyecto todavia no arranco: no hay ninguna etapa completa. */
  isStart: boolean;
  /** Cuantas de las 6 etapas gateadas ya estan completas. */
  completed: number;
  total: number;
}

/**
 * Primera etapa que le falta al proyecto, para poder decirle a la persona
 * QUE hacer ahora en vez de dejarla frente a una lista de 8 etapas sin
 * saber por donde empezar (problema real: al crear un proyecto se caia en
 * una pantalla con el stepper y el panel de miembros, y la accion de
 * "contanos tu idea" no estaba por ningun lado).
 */
export function getNextStage(projectId: string, review: ReviewSummary | undefined): NextStage {
  const completed = GATED_STAGE_KEYS.filter((key) => review?.stages[key]?.complete).length;
  const total = GATED_STAGE_KEYS.length;

  // Todas las gateadas listas: lo que sigue es revisar y generar.
  if (completed === total) {
    const stage = review?.readyToGenerate ? STAGE_DEFS[7] : STAGE_DEFS[6];
    return { id: stage.id, label: stage.label, to: `/projects/${projectId}/${stage.to}`, isStart: false, completed, total };
  }

  const stage = STAGE_DEFS[completed];
  return {
    id: stage.id,
    label: stage.label,
    to: `/projects/${projectId}/${stage.to}`,
    isStart: completed === 0,
    completed,
    total,
  };
}

/**
 * `complete` por etapa viene de getReviewSummary (US-033, ya calculado por
 * el backend) - no se reimplementa ninguna regla de negocio aca, solo se
 * traduce ese estado a los status visuales del Stepper. "review" se
 * considera completa cuando el proyecto esta listo para generar (sin
 * bloqueos/inconsistencias): es lo mismo que ya decide si el boton de
 * ReviewChecklist esta habilitado. "documents" no tiene señal propia de
 * "generado" en el contrato actual, asi que solo se bloquea/desbloquea.
 */
export function buildProjectSteps(projectId: string, review: ReviewSummary | undefined): Step[] {
  function completeUpTo(index: number): boolean {
    if (!review) return false;
    for (let i = 0; i <= index; i += 1) {
      if (!review.stages[GATED_STAGE_KEYS[i]]?.complete) return false;
    }
    return true;
  }

  return STAGE_DEFS.map((stage, index) => {
    const to = `/projects/${projectId}/${stage.to}`;

    if (stage.id === 'documents') {
      const unlocked = review?.readyToGenerate ?? false;
      return unlocked
        ? { id: stage.id, label: stage.label, status: 'available', to }
        : {
            id: stage.id,
            label: stage.label,
            status: 'locked',
            lockedReason: 'Resolvé la revisión final para generar los documentos.',
          };
    }

    if (stage.id === 'review') {
      if (!completeUpTo(LAST_GATED_INDEX)) {
        return {
          id: stage.id,
          label: stage.label,
          status: 'locked',
          lockedReason: 'Completá las pruebas para llegar a la revisión final.',
        };
      }
      return {
        id: stage.id,
        label: stage.label,
        status: review?.readyToGenerate ? 'completed' : 'available',
        to,
      };
    }

    // Etapas gateadas (definition..testing): bloqueada si la anterior no esta completa.
    const isComplete = review ? completeUpTo(index) : false;
    if (isComplete) return { id: stage.id, label: stage.label, status: 'completed', to };
    if (index === 0) return { id: stage.id, label: stage.label, status: 'available', to };

    const previousComplete = review ? completeUpTo(index - 1) : false;
    if (!previousComplete) {
      return {
        id: stage.id,
        label: stage.label,
        status: 'locked',
        lockedReason: `Completá "${STAGE_DEFS[index - 1].label}" para desbloquear esta etapa.`,
      };
    }
    return { id: stage.id, label: stage.label, status: 'available', to };
  });
}
