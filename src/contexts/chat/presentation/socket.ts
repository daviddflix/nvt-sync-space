import { Server, Socket } from 'socket.io';
import { MessageRepository } from '../infrastructure/messageRepository';
import { ReactionRepository } from '../infrastructure/reactionRepository';

export function initChatSocket(
  io: Server,
  messageRepo: MessageRepository,
  reactionRepo: ReactionRepository,
): void {
  io.of(/^\/org\/\w+$/).on('connection', (socket: Socket) => {
    socket.on('joinChannel', (channelId: string) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on('typing', data => {
      const room = `channel:${data.channelId}`;
      socket.to(room).emit('typing', { channelId: data.channelId, userId: data.userId });
    });

    socket.on('postMessage', async data => {
      const message = await messageRepo.createMessage(
        data.channelId,
        data.userId,
        data.content,
      );
      io.to(`channel:${data.channelId}`).emit('newMessage', message);
    });

    socket.on('addReaction', async data => {
      const reaction = await reactionRepo.addReaction(
        data.messageId,
        data.userId,
        data.emoji,
      );
      const message = await messageRepo.getMessageById(data.messageId);
      io.to(`channel:${message.channelId}`).emit('reactionAdded', reaction);
    });
  });
}
