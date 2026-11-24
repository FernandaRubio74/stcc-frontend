// Mismo shape que testing/schema.js del backend.

export type RiskLevel = 'alto' | 'medio' | 'bajo';

export interface RiskPriority {
  item: string;
  risk: RiskLevel;
  rationale: string;
}

export interface TestStrategy {
  inScope: string[];
  outOfScope: string[];
  riskPriorities: RiskPriority[];
}

export interface AcceptanceCase {
  id: string;
  ruleRef: string;
  given: string;
  when: string;
  then: string;
}

export interface EndpointCase {
  endpointRef: string;
  happyPath: string;
  invalidData: string;
  unauthorized: string;
}

export interface ScreenCase {
  screenRef: string;
  loading: string;
  empty: string;
  error: string;
}

export interface E2eFlow {
  name: string;
  steps: string[];
  relatedCaseIds: string[];
}

export type SecurityCaseType = 'permisos' | 'id-adivinado' | 'token-vencido';

export interface SecurityCase {
  id: string;
  description: string;
  type: SecurityCaseType;
}

export interface NegativeCase {
  id: string;
  description: string;
  expectedRejection: string;
}

export interface UsabilityCase {
  id: string;
  description: string;
}

export interface TestDataNeed {
  entity: string;
  environment: string;
  description: string;
}

export interface TraceabilityEntry {
  requirementRef: string;
  caseIds: string[];
}

export interface TestPlanContent {
  strategy: TestStrategy;
  acceptanceCases: AcceptanceCase[];
  endpointCases: EndpointCase[];
  screenCases: ScreenCase[];
  e2eFlows: E2eFlow[];
  securityCases: SecurityCase[];
  negativeCases: NegativeCase[];
  usabilityCases: UsabilityCase[];
  testData: TestDataNeed[];
  traceabilityMatrix: TraceabilityEntry[];
}

export type TestPlanVersionStatus = 'DRAFT' | 'APPROVED';

export interface TestPlanVersionView {
  id: string;
  versionNumber: number;
  status: TestPlanVersionStatus;
  content: TestPlanContent;
  createdAt: string;
  createdById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  /**
   * Que falta cubrir todavia, o null si el plan cubre todo. El borrador se
   * guarda igual con huecos (antes la generacion se descartaba entera con
   * un 409); lo que no se puede es aprobarlo asi.
   */
  coverageGaps?: CoverageGaps | null;
}

export interface TestPlanState {
  draft: TestPlanVersionView | null;
  approved: TestPlanVersionView | null;
}

/** Forma de los gaps que devuelve el backend en un 409 de cobertura. */
export interface CoverageGaps {
  missingRequirements: string[];
  missingEndpoints: string[];
  missingScreens: string[];
}
