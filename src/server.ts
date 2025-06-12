import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import pool from './shared/database/connection';
import { logger } from './shared/middleware/logger';
import { ChannelRepository } from './contexts/chat/infrastructure/channelRepository';
import { MessageRepository } from './contexts/chat/infrastructure/messageRepository';
import { ReactionRepository } from './contexts/chat/infrastructure/reactionRepository';
import { createChatRouter } from './contexts/chat/presentation/routes';
import { initChatSocket } from './contexts/chat/presentation/socket';

export function createApp() {
  const app = express();
  app.use(logger);
  app.use(express.json());
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const channelRepo = new ChannelRepository(pool);
  const messageRepo = new MessageRepository(pool);
  const reactionRepo = new ReactionRepository(pool);

  app.use('/org/:orgId/channels', createChatRouter(channelRepo, messageRepo));

  const server = http.createServer(app);
  const io = new IOServer(server);
  initChatSocket(io, messageRepo, reactionRepo);

  return { app, server, io };
}

const { app, server } = createApp();
export default app;
export { server };

if (require.main === module) {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`); // eslint-disable-line no-console
  });
}
