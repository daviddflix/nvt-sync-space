import request from 'supertest';
import app from '../../src/server';

describe('validation middleware', () => {
  it('returns 400 for invalid data', async () => {
    const res = await request(app)
      .post('/echo')
      .send({});
    expect(res.status).toBe(400);
  });

  it('passes with valid data', async () => {
    const res = await request(app)
      .post('/echo')
      .send({ message: 'hello' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'hello' });
  });
});
