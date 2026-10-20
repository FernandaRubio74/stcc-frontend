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
}

export interface PostDefinitionMessageResult {
  stage: DefinitionStage;
  reply: string;
  stageComplete: boolean;
  blockingQuestions: string[];
  definition: DefinitionSummary;
}
