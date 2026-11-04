import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getInstallationToken } from '../src/services/fetchers/utils/github.installationToken.js';
import { githubREST } from '../src/services/fetchers/utils/github.api.util.js';
import * as redis from '../src/db/redis.js';

const connection = vi.hoisted(() => ({ connected: true }));

vi.mock('../src/db/redis.js', () => ({
    get isConnected() {
        return connection.connected;
    },
    getCache: vi.fn(),
    setCacheIfNotExists: vi.fn(),
    setCache: vi.fn(),
    delCache: vi.fn(),
}));
vi.mock('../src/services/fetchers/utils/github.api.util.js', () => ({ githubREST: vi.fn() }));
vi.mock('../src/config/bootConfig.js', () => ({
    bootEnv: { GITHUB_APP_ID: 'test-app', GITHUB_APP_PRIVATE_KEY: 'test-key' },
}));
vi.mock('node:crypto', () => ({ sign: vi.fn(() => Buffer.from('test-signature')) }));
vi.mock('../src/utils/logger.js', () => ({
    getLogger: () => ({ debug: vi.fn(), error: vi.fn() }),
}));

beforeEach(() => {
    vi.resetAllMocks();
    connection.connected = true;
    vi.mocked(redis.getCache).mockResolvedValue(null);
    vi.mocked(redis.setCacheIfNotExists).mockResolvedValue(true);
    vi.mocked(githubREST).mockResolvedValue({
        token: 'github-token',
        expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    });
});

afterEach(() => vi.useRealTimers());

describe('GitHub installation tokens', () => {
    it.each(['disabled', 'disconnected', 'lock command failed'])(
        'requests a token directly when Redis is %s',
        async (reason) => {
            connection.connected = reason === 'lock command failed';
            vi.mocked(redis.setCacheIfNotExists).mockResolvedValue(null);

            await expect(getInstallationToken(123)).resolves.toBe('github-token');

            expect(githubREST).toHaveBeenCalledOnce();
            expect(githubREST).toHaveBeenCalledWith(
                'https://api.github.com/app/installations/123/access_tokens',
                expect.any(String),
            );
            expect(redis.setCache).not.toHaveBeenCalled();
            expect(redis.delCache).not.toHaveBeenCalled();
        },
    );

    it('reuses a valid cached token without calling GitHub', async () => {
        vi.mocked(redis.getCache).mockResolvedValue({
            token: 'cached-token',
            expires_at: new Date(Date.now() + 3_600_000).toISOString(),
        });

        await expect(getInstallationToken(123)).resolves.toBe('cached-token');

        expect(githubREST).not.toHaveBeenCalled();
        expect(redis.setCacheIfNotExists).not.toHaveBeenCalled();
    });

    it('caches a new token and releases an acquired lock', async () => {
        await expect(getInstallationToken(123)).resolves.toBe('github-token');

        expect(redis.setCache).toHaveBeenCalledWith(
            'collector:github:installation:123:token',
            expect.objectContaining({ token: 'github-token' }),
            expect.any(Number),
        );
        expect(redis.delCache).toHaveBeenCalledWith('collector:github:installation:123:lock');
    });

    it('waits for another process when the lock is occupied', async () => {
        vi.useFakeTimers();
        vi.mocked(redis.setCacheIfNotExists).mockResolvedValue(false);
        vi.mocked(redis.getCache)
            .mockResolvedValueOnce(null)
            .mockResolvedValue({
                token: 'other-process-token',
                expires_at: new Date(Date.now() + 3_600_000).toISOString(),
            });

        const result = getInstallationToken(123);
        await vi.advanceTimersByTimeAsync(150);

        await expect(result).resolves.toBe('other-process-token');
        expect(githubREST).not.toHaveBeenCalled();
    });

    it('requests a token if Redis disconnects while waiting for another process', async () => {
        vi.useFakeTimers();
        vi.mocked(redis.setCacheIfNotExists).mockResolvedValue(false);

        const result = getInstallationToken(123);
        await vi.advanceTimersByTimeAsync(0);
        connection.connected = false;
        await vi.advanceTimersByTimeAsync(150);

        await expect(result).resolves.toBe('github-token');
        expect(githubREST).toHaveBeenCalledOnce();
        expect(redis.delCache).not.toHaveBeenCalled();
    });

    it('propagates GitHub errors and releases an acquired lock', async () => {
        vi.mocked(githubREST).mockRejectedValue(new Error('GitHub unavailable'));

        await expect(getInstallationToken(123)).rejects.toThrow('GitHub unavailable');

        expect(redis.delCache).toHaveBeenCalledOnce();
    });
});
