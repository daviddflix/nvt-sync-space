import { IOrganizationRepository } from '../domain/IOrganizationRepository';
import { Organization } from '../domain/Organization';

export default class OrganizationService {
  constructor(private readonly repo: IOrganizationRepository) {}

  async createOrganization(name: string, description: string | undefined, userId: string): Promise<Organization> {
    const existing = await this.repo.findByName(name);
    if (existing) {
      throw new Error('Organization name already exists');
    }
    return this.repo.create(name, description, userId);
  }

  async listOrganizations(userId: string) {
    return this.repo.listForUser(userId);
  }

  async getOrganization(id: string) {
    return this.repo.findById(id);
  }

  async updateOrganization(id: string, name: string, description: string | undefined) {
    return this.repo.update(id, name, description);
  }

  async deleteOrganization(id: string) {
    await this.repo.delete(id);
  }

  async addMember(orgId: string, userId: string, role: string) {
    await this.repo.addMember(orgId, userId, role);
  }

  async removeMember(orgId: string, userId: string) {
    await this.repo.removeMember(orgId, userId);
  }
}
