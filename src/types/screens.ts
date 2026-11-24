export type ProjectRole = 'owner' | 'editor' | 'viewer';

export type ScreenElementType = 'list' | 'form' | 'field' | 'button' | 'text' | 'image' | 'nav';

export interface ScreenElement {
  type: ScreenElementType;
  label: string;
  // "Entidad.atributo" real del modelo de datos aprobado, o null.
  dataField: string | null;
  // "METODO /ruta" real de la API aprobada, o null.
  endpointRef: string | null;
}

export interface Screen {
  name: string;
  purpose: string;
  mainElements: ScreenElement[];
  visibleToRoles: ProjectRole[];
}

export interface NavigationEdge {
  from: string;
  to: string;
  label: string;
}

export type ScreenMapVersionStatus = 'DRAFT' | 'APPROVED';

export interface ScreenMapVersionView {
  id: string;
  versionNumber: number;
  status: ScreenMapVersionStatus;
  screens: Screen[];
  navigation: NavigationEdge[];
  diagram: string;
  createdAt: string;
  createdById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
}

export interface ScreenMapState {
  draft: ScreenMapVersionView | null;
  approved: ScreenMapVersionView | null;
}
