import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async authenticate(email: string, password: string): Promise<string | null> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return null;
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return null;
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
  }
}
