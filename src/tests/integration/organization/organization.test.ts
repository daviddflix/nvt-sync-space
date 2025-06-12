import request from 'supertest';
import app from '../../../server';
import { organizationRepository } from '../../../contexts/organization/infrastructure/OrganizationRepository';

describe('Organization API', () => {
  it('creates organization with admin membership', async () => {
    const res = await request(app)
      .post('/organizations')
      .send({ name: 'Test Org', userId: 'u1', description: 'desc' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Org');

    const members = await organizationRepository.listMembers(res.body.id);
    const member = members.find(m => m.userId === 'u1');
    expect(member?.role).toBe('admin');
  });

  it('prevents duplicate organization names', async () => {
    const res = await request(app)
      .post('/organizations')
      .send({ name: 'Test Org', userId: 'u2' });
    expect(res.status).toBe(400);
  });

  it('supports CRUD operations', async () => {
    const create = await request(app)
      .post('/organizations')
      .send({ name: 'Org2', userId: 'u3' });
    const id = create.body.id;

    const get = await request(app).get(`/organizations/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe('Org2');

    const update = await request(app)
      .put(`/organizations/${id}`)
      .send({ description: 'updated' });
    expect(update.status).toBe(200);
    expect(update.body.description).toBe('updated');

    const del = await request(app).delete(`/organizations/${id}`);
    expect(del.status).toBe(204);

    const afterDelete = await request(app).get(`/organizations/${id}`);
    expect(afterDelete.status).toBe(404);
  });
});
