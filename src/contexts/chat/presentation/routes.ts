import { Router } from 'express';
import { ChannelRepository } from '../infrastructure/channelRepository';
import { MessageRepository } from '../infrastructure/messageRepository';

export function createChatRouter(
  channelRepo: ChannelRepository,
  messageRepo: MessageRepository,
): Router {
  const router = Router({ mergeParams: true });

  router.post('/', async (req, res) => {
    const { orgId } = req.params;
    const { name, description, isPrivate, userId } = req.body;
    const channel = await channelRepo.createChannel(
      orgId,
      name,
      description || null,
      Boolean(isPrivate),
      userId,
    );
    res.status(201).json(channel);
  });

  router.post('/:channelId/messages', async (req, res) => {
    const { channelId } = req.params;
    const { userId, content } = req.body;
    const message = await messageRepo.createMessage(channelId, userId, content);
    res.status(201).json(message);
  });

  return router;
}
