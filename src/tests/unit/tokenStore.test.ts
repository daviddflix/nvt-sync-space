import { revokeToken, isTokenRevoked } from '../../src/contexts/auth/application/utils/tokenStore';

describe('token store', () => {
  it('revokes token', () => {
    revokeToken('abc');
    expect(isTokenRevoked('abc')).toBe(true);
  });
});
