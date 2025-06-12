import { Pool } from 'pg';
import { User } from '../domain/entities/User';
import { UserRepository } from '../domain/repositories/UserRepository';

export class UserRepositoryPg implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<User | null> {
    const res = await this.pool.query(
      'SELECT id, email, password_hash FROM users WHERE id = $1',
      [id]
    );
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    return { id: row.id, email: row.email, passwordHash: row.password_hash };
  }

  async findByEmail(email: string): Promise<User | null> {
    const res = await this.pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    return { id: row.id, email: row.email, passwordHash: row.password_hash };
  }

  async create(user: User): Promise<User> {
    const res = await this.pool.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, password_hash',
      [user.id, user.email, user.passwordHash]
    );
    const row = res.rows[0];
    return { id: row.id, email: row.email, passwordHash: row.password_hash };
  }
}
