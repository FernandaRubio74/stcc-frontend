export type StageKey = 'definition' | 'dataModel' | 'apiSpec' | 'screens' | 'architecture' | 'testing';

export interface StageStatus {
  complete: boolean;
  [key: string]: unknown;
}

/** Estados del motor de consistencia. Solo "error" bloquea la generacion final. */
export type ConsistencyStatus = 'ok' | 'pendiente' | 'advertencia' | 'error';

export interface Inconsistency {
  rule: string;
  stages: string[];
  message: string;
  /** Campos aditivos del motor (pueden faltar en respuestas viejas). */
  id?: string;
  status?: ConsistencyStatus;
  evidence?: string;
  /** Sugerencia accionable redactada por el backend: es la fuente de verdad. */
  suggestion?: string;
}

/** Estado de UNA regla, incluidas las que todavia no se pueden evaluar. */
export interface ConsistencyCheck {
  rule: string;
  stages: string[];
  status: ConsistencyStatus;
  message: string;
  pendingStages?: string[];
}

export interface BlockingQuestion {
  id: string;
  stage: string;
  question: string;
  createdAt: string;
}

export interface KeyDecisions {
  problemSummary: string | null;
  dataModelVersion: number | null;
  apiSpecVersion: number | null;
  selectedArchitecture: string | null;
  screenMapVersion: number | null;
  testPlanVersion: number | null;
}

export interface ReviewSummary {
  stages: Record<StageKey, StageStatus>;
  keyDecisions: KeyDecisions;
  blockingQuestions: BlockingQuestion[];
  inconsistencies: Inconsistency[];
  readyToGenerate: boolean;
}
