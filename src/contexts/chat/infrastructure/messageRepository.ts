import { Pool } from 'pg';
import { Message } from '../domain/Message';

export class MessageRepository {
  constructor(private readonly pool: Pool) {}

  async createMessage(
    channelId: string,
    userId: string,
    content: string,
    replyToId?: string,
  ): Promise<Message> {
    const result = await this.pool.query<Message>(
      `INSERT INTO messages (channel_id, user_id, content, reply_to_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [channelId, userId, content, replyToId || null],
    );
    return result.rows[0];
  }

  async getMessageById(id: string): Promise<Message> {
    const result = await this.pool.query<Message>(
      'SELECT * FROM messages WHERE id = $1',
      [id],
    );
    return result.rows[0];
  }
}
