export interface ForeignKeyRef {
  entity: string;
  attribute: string;
}

export interface Attribute {
  name: string;
  type: string;
  primaryKey: boolean;
  unique: boolean;
  nullable: boolean;
  foreignKey: ForeignKeyRef | null;
}

export interface EntityIndex {
  name: string;
  attributes: string[];
  unique: boolean;
}

export interface Entity {
  name: string;
  attributes: Attribute[];
  indexes: EntityIndex[];
}

export type DataModelVersionStatus = 'DRAFT' | 'APPROVED';

export interface DataModelVersionView {
  id: string;
  versionNumber: number;
  status: DataModelVersionStatus;
  entities: Entity[];
  diagram: string | null;
  createdAt: string;
  createdById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
}

export interface DataModelState {
  draft: DataModelVersionView | null;
  approved: DataModelVersionView | null;
}
