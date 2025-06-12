import { generateAccessToken, generateRefreshToken, verifyToken } from '../../src/contexts/auth/application/utils/jwt';

describe('token generation', () => {
  it('generates verifiable access token', () => {
    const token = generateAccessToken('user1');
    const payload = verifyToken<{ sub: string }>(token);
    expect(payload.sub).toBe('user1');
  });

  it('generates refresh token with jti', () => {
    const token = generateRefreshToken('user1');
    const payload = verifyToken<{ sub: string; jti: string }>(token);
    expect(payload.sub).toBe('user1');
    expect(typeof payload.jti).toBe('string');
  });
});
