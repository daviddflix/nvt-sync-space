import request from 'supertest';
import express from 'express';
import { createChatRouter } from '../../src/contexts/chat/presentation/routes';
import {
  InMemoryChannelRepository,
  InMemoryMessageRepository,
} from '../helpers/inMemoryRepos';

describe('channel creation', () => {
  it('adds creator as member', async () => {
    const channelRepo = new InMemoryChannelRepository();
    const messageRepo = new InMemoryMessageRepository();
    const app = express();
    app.use(express.json());
    app.use('/org/:orgId/channels', createChatRouter(channelRepo, messageRepo));

    const res = await request(app)
      .post('/org/org1/channels')
      .send({ name: 'dev', description: '', isPrivate: false, userId: 'u1' });

    expect(res.status).toBe(201);
    const channelId = res.body.id;
    expect(channelRepo.members[channelId].has('u1')).toBe(true);
  });
});
