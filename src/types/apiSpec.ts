export interface EndpointParameter {
  name: string;
  in: 'path' | 'query' | 'body';
  type: string;
  required: boolean;
  description: string;
}

export interface EndpointResponse {
  status: number;
  description: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Endpoint {
  method: HttpMethod;
  path: string;
  description: string;
  resourceEntity: string;
  parameters: EndpointParameter[];
  responses: EndpointResponse[];
}

export type ApiSpecVersionStatus = 'DRAFT' | 'APPROVED';

export interface ApiSpecVersionView {
  id: string;
  versionNumber: number;
  status: ApiSpecVersionStatus;
  endpoints: Endpoint[];
  createdAt: string;
  createdById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
}

export interface ApiSpecState {
  draft: ApiSpecVersionView | null;
  approved: ApiSpecVersionView | null;
}
