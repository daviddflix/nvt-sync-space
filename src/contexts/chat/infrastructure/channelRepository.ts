import { Pool } from 'pg';
import { Channel } from '../domain/Channel';

export class ChannelRepository {
  constructor(private readonly pool: Pool) {}

  async createChannel(
    organizationId: string,
    name: string,
    description: string | null,
    isPrivate: boolean,
    createdBy: string,
  ): Promise<Channel> {
    const result = await this.pool.query<Channel>(
      `INSERT INTO channels (organization_id, name, description, is_private, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [organizationId, name, description, isPrivate, createdBy],
    );
    const channel = result.rows[0];
    await this.addMember(channel.id, createdBy);
    return channel;
  }

  async addMember(channelId: string, userId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO channel_members (channel_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (channel_id, user_id) DO NOTHING`,
      [channelId, userId],
    );
  }
}
