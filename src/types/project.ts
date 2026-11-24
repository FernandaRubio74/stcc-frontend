export type ProjectRole = 'owner' | 'editor' | 'viewer';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: string;
  createdById: string;
}

export interface ProjectDetail extends Project {
  updatedAt: string;
  role: ProjectRole;
}

export interface ProjectProgress {
  completedStages: number;
  totalStages: number;
}

// Lo que devuelve GET /projects (US-065): a diferencia de ProjectDetail,
// el rol es el del usuario en ESE proyecto particular (no resuelto por el
// middleware de membresia, que aca no corre - es un listado), y suma el
// progreso liviano de las 5 etapas gateadas para la barra de la tarjeta.
export interface ProjectListItem extends Project {
  updatedAt: string;
  role: ProjectRole;
  progress: ProjectProgress;
}

export interface ProjectMember {
  id: string;
  role: ProjectRole;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}
