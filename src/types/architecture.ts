export interface ArchitectureScenario {
  id: string;
  name: string;
  summary: string;
  persistence: string;
  backend: string;
  frontend: string;
  communication: string;
  infrastructure: string;
  operation: string;
  observability: string;
  authSsoAuthorization: string;
}

export interface ArchitectureState {
  recommendedId: string | null;
  justification: string | null;
  selectedId: string | null;
  selectedAt: string | null;
  selectedById: string | null;
}
