import { beforeEach, describe, expect, it, vi } from 'vitest';
import { connectRedis, setCacheIfNotExists } from '../src/db/redis.js';

const mock = vi.hoisted(() => ({
    set: vi.fn(),
    events: {} as Record<string, () => void>,
}));

vi.mock('redis', () => ({
    createClient: () => ({
        on: (event: string, listener: () => void) => {
            mock.events[event] = listener;
        },
        connect: async () => mock.events.ready(),
        set: mock.set,
    }),
}));
vi.mock('../src/config/bootConfig.js', () => ({
    bootEnv: { REDIS_ENABLED: true, REDIS_URI: 'redis://test' },
}));
vi.mock('../src/utils/logger.js', () => ({
    getLogger: () => ({
        setTag: () => ({ info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() }),
    }),
}));

beforeEach(async () => {
    mock.set.mockReset();
    await connectRedis();
});

describe('Redis locks', () => {
    it('reports unavailability when disconnected', async () => {
        mock.events.end();

        await expect(setCacheIfNotExists('lock', 'rotating')).resolves.toBeNull();
        expect(mock.set).not.toHaveBeenCalled();
    });

    it('reports unavailability when the command fails', async () => {
        mock.set.mockRejectedValue(new Error('Connection lost'));

        await expect(setCacheIfNotExists('lock', 'rotating')).resolves.toBeNull();
    });

    it.each([
        { reply: 'OK', acquired: true },
        { reply: null, acquired: false },
    ])('reports acquired=$acquired for a successful command', async ({ reply, acquired }) => {
        mock.set.mockResolvedValue(reply);

        await expect(setCacheIfNotExists('lock', 'rotating')).resolves.toBe(acquired);
    });
});
