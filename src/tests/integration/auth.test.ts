import request from 'supertest';
import app from '../../src/server';

describe('auth flow', () => {
  it('registers and logs in user', async () => {
    const email = 'test@example.com';
    const password = 'password';
    const resRegister = await request(app).post('/auth/register').send({ email, password });
    expect(resRegister.status).toBe(201);
    expect(resRegister.body.accessToken).toBeDefined();
    expect(resRegister.body.refreshToken).toBeDefined();

    const resLogin = await request(app).post('/auth/login').send({ email, password });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body.accessToken).toBeDefined();
    expect(resLogin.body.refreshToken).toBeDefined();
  });
});
