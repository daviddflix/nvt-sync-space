import { v4 as uuid } from 'uuid';
import { Organization, Membership } from '../domain/Organization';

export class OrganizationRepository {
  private organizations: Organization[] = [];
  private memberships: Membership[] = [];

  constructor() {
    this.seedDefault();
  }

  private seedDefault(): void {
    if (this.organizations.length === 0) {
      const orgId = uuid();
      const userId = 'admin-user';
      const now = new Date();
      this.organizations.push({
        id: orgId,
        name: 'Platform Workspace',
        slug: 'platform-workspace',
        description: 'Default organization',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      this.memberships.push({
        id: uuid(),
        userId,
        organizationId: orgId,
        role: 'admin',
        joinedAt: now,
      });
    }
  }

  async create(name: string, userId: string, description?: string): Promise<Organization> {
    if (this.organizations.some(o => o.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Organization name must be unique');
    }
    const now = new Date();
    const organization: Organization = {
      id: uuid(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.organizations.push(organization);
    this.memberships.push({
      id: uuid(),
      userId,
      organizationId: organization.id,
      role: 'admin',
      joinedAt: now,
    });
    return organization;
  }

  async findAll(): Promise<Organization[]> {
    return this.organizations.filter(o => o.isActive);
  }

  async findById(id: string): Promise<Organization | undefined> {
    return this.organizations.find(o => o.id === id && o.isActive);
  }

  async update(id: string, data: Partial<Pick<Organization, 'name' | 'slug' | 'description'>>): Promise<Organization | undefined> {
    const org = await this.findById(id);
    if (!org) return undefined;
    if (data.name && data.name !== org.name) {
      if (this.organizations.some(o => o.name.toLowerCase() === data.name!.toLowerCase() && o.id !== id)) {
        throw new Error('Organization name must be unique');
      }
      org.name = data.name;
      org.slug = data.name.toLowerCase().replace(/\s+/g, '-');
    }
    if (data.slug) org.slug = data.slug;
    if (data.description !== undefined) org.description = data.description;
    org.updatedAt = new Date();
    return org;
  }

  async delete(id: string): Promise<void> {
    const org = await this.findById(id);
    if (org) {
      org.isActive = false;
      org.updatedAt = new Date();
    }
  }

  async listMembers(organizationId: string): Promise<Membership[]> {
    return this.memberships.filter(m => m.organizationId === organizationId);
  }

  async addMember(organizationId: string, userId: string, role: 'admin' | 'member'): Promise<Membership> {
    if (this.memberships.some(m => m.organizationId === organizationId && m.userId === userId)) {
      throw new Error('User already member');
    }
    const membership: Membership = {
      id: uuid(),
      userId,
      organizationId,
      role,
      joinedAt: new Date(),
    };
    this.memberships.push(membership);
    return membership;
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    this.memberships = this.memberships.filter(m => !(m.organizationId === organizationId && m.userId === userId));
  }
}

export const organizationRepository = new OrganizationRepository();
