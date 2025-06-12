import { hashPassword, comparePassword } from '../../src/contexts/auth/application/utils/password';

describe('password hashing', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('secret');
    expect(hash).not.toBe('secret');
    const valid = await comparePassword('secret', hash);
    expect(valid).toBe(true);
  });
});
