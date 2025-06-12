import { UserRepository } from '../domain/UserRepository';
import { User } from '../domain/User';

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async findByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async updateRefreshToken(userId: string, token: string | null): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      if (token) user.refreshToken = token;
      else delete user.refreshToken;
    }
  }
}
