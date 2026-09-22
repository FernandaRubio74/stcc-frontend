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
