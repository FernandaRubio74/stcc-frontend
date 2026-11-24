export type DefinitionStage = 'PROBLEM_CONTEXT' | 'TARGET_USERS_SCOPE';

export type DefinitionMessageRole = 'user' | 'assistant';

export interface DefinitionMessage {
  id: string;
  stage: DefinitionStage;
  role: DefinitionMessageRole;
  content: string;
  createdAt: string;
}

export interface BlockingQuestion {
  id: string;
  stage: DefinitionStage;
  question: string;
  createdAt: string;
}

export interface TargetUser {
  label: string;
  description: string;
}

export interface MvpScope {
  in: string[];
  out: string[];
}

export interface DefinitionSummary {
  currentStage: DefinitionStage;
  problemSummary: string | null;
  targetUsers: TargetUser[] | null;
  mvpScope: MvpScope | null;
  userJourney: string[] | null;
  updatedAt: string;
}

export interface DefinitionState extends DefinitionSummary {
  messages: DefinitionMessage[];
  blockingQuestions: BlockingQuestion[];
  /** Respuestas de un click propuestas por el agente de sugerencias (separado
   * del que conduce la conversacion) - vacio si todavia no hay ninguna. */
  suggestions: string[];
  /** Si la etapa actual ya esta completa (misma regla que usa advanceStage). */
  stageComplete: boolean;
}

export interface PostDefinitionMessageResult {
  stage: DefinitionStage;
  reply: string;
  stageComplete: boolean;
  blockingQuestions: string[];
  definition: DefinitionSummary;
  suggestions: string[];
}

export interface AdvanceStageResult extends DefinitionSummary {
  /** Sugerencias para responder al anuncio de cambio de etapa (el backend
   * tambien persiste ese anuncio como mensaje del asistente en la etapa
   * nueva - llega al refetch de la query, no en esta respuesta). */
  suggestions: string[];
}
