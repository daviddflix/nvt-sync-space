import { Pool } from 'pg';
import { Reaction } from '../domain/Reaction';

export class ReactionRepository {
  constructor(private readonly pool: Pool) {}

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Reaction> {
    const result = await this.pool.query<Reaction>(
      `INSERT INTO message_reactions (message_id, user_id, emoji)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [messageId, userId, emoji],
    );
    return result.rows[0];
  }
}
