import request from 'supertest';
import app from '../../src/server';
import pool from '../../src/shared/database/connection';

async function createUser(email: string) {
  const res = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name)
     VALUES ($1, 'hash', 'Test', 'User') RETURNING id`,
    [email],
  );
  return res.rows[0].id as string;
}

describe('Organization CRUD', () => {
  let userId: string;

  beforeAll(async () => {
    userId = await createUser('testuser@example.com');
  });

  it('creates organization and assigns admin role', async () => {
    const res = await request(app)
      .post('/v1/orgs')
      .set('x-user-id', userId)
      .send({ name: 'Test Org', description: 'desc' });
    expect(res.status).toBe(201);
    const orgId = res.body.id;
    const roleRes = await pool.query(
      'SELECT role FROM user_organizations WHERE user_id=$1 AND organization_id=$2',
      [userId, orgId],
    );
    expect(roleRes.rows[0].role).toBe('admin');
  });

  it('enforces unique organization names', async () => {
    const res = await request(app)
      .post('/v1/orgs')
      .set('x-user-id', userId)
      .send({ name: 'Test Org' });
    expect(res.status).toBe(400);
  });

  it('updates and deletes organization', async () => {
    const create = await request(app)
      .post('/v1/orgs')
      .set('x-user-id', userId)
      .send({ name: 'Org To Update' });
    const id = create.body.id;
    const update = await request(app)
      .put(`/v1/orgs/${id}`)
      .set('x-user-id', userId)
      .send({ name: 'Updated Org' });
    expect(update.body.name).toBe('Updated Org');
    await request(app).delete(`/v1/orgs/${id}`).set('x-user-id', userId);
    const get = await request(app).get(`/v1/orgs/${id}`).set('x-user-id', userId);
    expect(get.status).toBe(404);
  });

  it('adds member with specified role', async () => {
    const otherUser = await createUser('member@example.com');
    const create = await request(app)
      .post('/v1/orgs')
      .set('x-user-id', userId)
      .send({ name: 'Org With Member' });
    const orgId = create.body.id;
    await request(app)
      .post(`/v1/orgs/${orgId}/members`)
      .set('x-user-id', userId)
      .send({ userId: otherUser, role: 'member' })
      .expect(204);
    const roleRes = await pool.query(
      'SELECT role FROM user_organizations WHERE user_id=$1 AND organization_id=$2',
      [otherUser, orgId],
    );
    expect(roleRes.rows[0].role).toBe('member');
  });
});
