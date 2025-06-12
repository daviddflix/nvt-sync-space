import { Organization } from './Organization';

export interface OrganizationWithRole extends Organization {
  role: string;
  joinedAt: Date;
}

export interface IOrganizationRepository {
  create(name: string, description: string | undefined, userId: string): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findByName(name: string): Promise<Organization | null>;
  listForUser(userId: string): Promise<OrganizationWithRole[]>;
  update(id: string, name: string, description: string | undefined): Promise<Organization | null>;
  delete(id: string): Promise<void>;
  addMember(orgId: string, userId: string, role: string): Promise<void>;
  removeMember(orgId: string, userId: string): Promise<void>;
}
