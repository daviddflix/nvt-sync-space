import { z } from 'zod';
import { UserRepository } from '../../domain/UserRepository';
import { hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { User } from '../../domain/User';
import { v4 as uuidv4 } from 'uuid';

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;

export class RegisterUser {
  constructor(private repo: UserRepository) {}

  async execute(dto: RegisterUserDto) {
    const data = registerUserSchema.parse(dto);
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new Error('User already exists');
    }
    const passwordHash = await hashPassword(data.password);
    const user = new User({ id: uuidv4(), email: data.email, passwordHash });
    await this.repo.save(user);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await this.repo.updateRefreshToken(user.id, refreshToken);
    return { user, accessToken, refreshToken };
  }
}
