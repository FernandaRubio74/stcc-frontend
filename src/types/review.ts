export type StageKey = 'definition' | 'dataModel' | 'apiSpec' | 'screens' | 'architecture';

export interface StageStatus {
  complete: boolean;
  [key: string]: unknown;
}

export interface Inconsistency {
  rule: string;
  stages: string[];
  message: string;
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
}

export interface ReviewSummary {
  stages: Record<StageKey, StageStatus>;
  keyDecisions: KeyDecisions;
  blockingQuestions: BlockingQuestion[];
  inconsistencies: Inconsistency[];
  readyToGenerate: boolean;
}
