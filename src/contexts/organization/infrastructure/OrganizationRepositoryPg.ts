import sql from 'sql-template-strings';
import pool from '../../../shared/database/connection';
import { IOrganizationRepository, OrganizationWithRole } from '../domain/IOrganizationRepository';
import { Organization } from '../domain/Organization';

export default class OrganizationRepositoryPg implements IOrganizationRepository {
  async create(name: string, description: string | undefined, userId: string): Promise<Organization> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const orgRes = await client.query<Organization>(
        sql`INSERT INTO organizations (name, slug, description)
            VALUES (${name}, ${slug}, ${description})
            RETURNING *`,
      );
      const org = orgRes.rows[0];
      await client.query(
        sql`INSERT INTO user_organizations (user_id, organization_id, role)
            VALUES (${userId}, ${org.id}, 'admin')`,
      );
      await client.query('COMMIT');
      return org;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Organization | null> {
    const res = await pool.query<Organization>(sql`SELECT * FROM organizations WHERE id = ${id}`);
    return res.rows[0] || null;
  }

  async findByName(name: string): Promise<Organization | null> {
    const res = await pool.query<Organization>(sql`SELECT * FROM organizations WHERE name = ${name}`);
    return res.rows[0] || null;
  }

  async listForUser(userId: string): Promise<OrganizationWithRole[]> {
    const res = await pool.query<OrganizationWithRole>(sql`
      SELECT o.*, uo.role, uo.joined_at AS "joinedAt"
      FROM organizations o
      JOIN user_organizations uo ON uo.organization_id = o.id
      WHERE uo.user_id = ${userId}
    `);
    return res.rows;
  }

  async update(id: string, name: string, description: string | undefined): Promise<Organization | null> {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const res = await pool.query<Organization>(
      sql`UPDATE organizations SET name=${name}, slug=${slug}, description=${description}, updated_at=NOW()
          WHERE id=${id}
          RETURNING *`,
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<void> {
    await pool.query(sql`DELETE FROM organizations WHERE id = ${id}`);
  }

  async addMember(orgId: string, userId: string, role: string): Promise<void> {
    await pool.query(
      sql`INSERT INTO user_organizations (user_id, organization_id, role)
          VALUES (${userId}, ${orgId}, ${role})
          ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role`,
    );
  }

  async removeMember(orgId: string, userId: string): Promise<void> {
    await pool.query(sql`DELETE FROM user_organizations WHERE organization_id=${orgId} AND user_id=${userId}`);
  }
}
