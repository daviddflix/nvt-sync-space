import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/server';

describe('authentication middleware', () => {
  const secret = 'testsecret';

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
  });

  it('allows access with valid token', async () => {
    const token = jwt.sign({ userId: '123', email: 'test@example.com' }, secret);
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: '123' });
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
  });
});
