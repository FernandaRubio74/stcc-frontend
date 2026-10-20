export type ProjectRole = 'owner' | 'editor' | 'viewer';

export interface Screen {
  name: string;
  purpose: string;
  mainElements: string[];
  visibleToRoles: ProjectRole[];
}

export interface NavigationEdge {
  from: string;
  to: string;
  label: string;
}

export interface ScreenMapState {
  screens: Screen[];
  navigation: NavigationEdge[];
  diagram: string;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
}
