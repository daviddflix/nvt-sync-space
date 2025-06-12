import { Channel } from '../../src/contexts/chat/domain/Channel';
import { Message } from '../../src/contexts/chat/domain/Message';
import { Reaction } from '../../src/contexts/chat/domain/Reaction';

export class InMemoryChannelRepository {
  public channels: Channel[] = [];
  public members: Record<string, Set<string>> = {};

  async createChannel(
    organizationId: string,
    name: string,
    description: string | null,
    isPrivate: boolean,
    createdBy: string,
  ): Promise<Channel> {
    const channel: Channel = {
      id: `ch-${this.channels.length + 1}`,
      organizationId,
      name,
      description,
      isPrivate,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.channels.push(channel);
    await this.addMember(channel.id, createdBy);
    return channel;
  }

  async addMember(channelId: string, userId: string): Promise<void> {
    if (!this.members[channelId]) this.members[channelId] = new Set();
    this.members[channelId].add(userId);
  }
}

export class InMemoryMessageRepository {
  public messages: Message[] = [];

  async createMessage(
    channelId: string,
    userId: string,
    content: string,
  ): Promise<Message> {
    const message: Message = {
      id: `m-${this.messages.length + 1}`,
      channelId,
      userId,
      content,
      messageType: 'text',
      replyToId: null,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  async getMessageById(id: string): Promise<Message> {
    return this.messages.find(m => m.id === id)!;
  }
}

export class InMemoryReactionRepository {
  public reactions: Reaction[] = [];

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Reaction> {
    const reaction: Reaction = {
      id: `r-${this.reactions.length + 1}`,
      messageId,
      userId,
      emoji,
      createdAt: new Date(),
    };
    this.reactions.push(reaction);
    return reaction;
  }
}
