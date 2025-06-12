import { User } from './User';

export interface UserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  save(user: User): Promise<void>;
  updateRefreshToken(userId: string, token: string | null): Promise<void>;
}
