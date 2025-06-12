import { initChatSocket } from '../../src/contexts/chat/presentation/socket';
import { InMemoryMessageRepository, InMemoryReactionRepository } from '../helpers/inMemoryRepos';

describe('socket message flow', () => {
  it('emits newMessage to room on postMessage', async () => {
    const messageRepo = new InMemoryMessageRepository();
    const reactionRepo = new InMemoryReactionRepository();

    const emitMock = jest.fn();
    const io = {
      of: jest.fn(() => ({ on: (event: string, cb: any) => { connectionCb = cb; } })),
      to: jest.fn(() => ({ emit: emitMock })),
    } as any;

    let connectionCb: any;
    initChatSocket(io, messageRepo as any, reactionRepo as any);

    const socketHandlers: Record<string, any> = {};
    const socket = {
      on: (event: string, cb: any) => { socketHandlers[event] = cb; },
      join: jest.fn(),
      to: jest.fn(() => ({ emit: jest.fn() })),
    } as any;

    connectionCb(socket);

    await socketHandlers['postMessage']({ channelId: 'c1', userId: 'u1', content: 'hi' });

    expect(emitMock).toHaveBeenCalledWith('newMessage', expect.objectContaining({ content: 'hi' }));
  });
});
