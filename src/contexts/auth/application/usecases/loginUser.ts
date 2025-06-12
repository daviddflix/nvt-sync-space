import { z } from 'zod';
import { UserRepository } from '../../domain/UserRepository';
import { comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;

export class LoginUser {
  constructor(private repo: UserRepository) {}

  async execute(dto: LoginUserDto) {
    const data = loginUserSchema.parse(dto);
    const user = await this.repo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await this.repo.updateRefreshToken(user.id, refreshToken);
    return { user, accessToken, refreshToken };
  }
}
