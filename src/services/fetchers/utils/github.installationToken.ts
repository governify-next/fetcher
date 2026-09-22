import { sign } from 'node:crypto';
import { bootEnv } from '../../../config/bootConfig.js';
import { ValidationError } from '../../../utils/customErrors.js';
import { githubREST } from './github.api.util.js';
import { getLogger } from '../../../utils/logger.js';
import * as redis from '../../../db/redis.js';

const TOKEN_KEY = (installationId: number) =>
    `collector:github:installation:${installationId}:token`;
const LOCK_KEY = (installationId: number) => `collector:github:installation:${installationId}:lock`;
const LOCK_TTL_SECONDS = 30;
const logger = getLogger('github.installationToken');
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getInstallationToken = async (installationId: number) => {
    logger.debug(`Getting installation token for installation with ID: ${installationId}.`);
    const token = await findValidTokenInCache(installationId);
    if (token) return token;

    const acquired = await redis.setCacheIfNotExists(
        LOCK_KEY(installationId),
        'rotating',
        LOCK_TTL_SECONDS,
    );
    if (!acquired) {
        // Case 2 (not valid, not creator): If installation needs a new token, but rotation exists, wait for resolution of existing rotation
        return waitForCachedToken(installationId);
    }

    try {
        // Case 3 (not valid, creator): If installation needs a new token, but rotation does not exists. Rotate token an delete lock when complete
        const { token, expires_at } = await rotateInstallationToken(installationId);
        await redis.setCache(
            TOKEN_KEY(installationId),
            { token, expires_at },
            Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000),
        ); // expires in aprox. 1 hour
        logger.debug(
            `New token generated and cached for the installation with ID ${installationId}. Token expires at ${expires_at}.`,
        );
        return token;
    } finally {
        await redis.delCache(LOCK_KEY(installationId));
        logger.debug(`Lock for the installation with ID ${installationId} deleted successfully.`);
    }
};

const waitForCachedToken = async (installationId: number) => {
    logger.debug(`Waiting for cached token for the installation with ID ${installationId}...`);
    const deadline = Date.now() + LOCK_TTL_SECONDS * 1000;
    while (Date.now() < deadline) {
        await delay(150);
        const token = await findValidTokenInCache(installationId);
        if (token) return token;
    }
    logger.error(
        `Timeout waiting for cached token for the installation with ID ${installationId}.`,
    );
    throw new Error(`Can not get a valid token for the installation with ID ${installationId}.`);
};

const isTokenValid = (expiresAt: string) => {
    const tokenExpiration = new Date(expiresAt).getTime() - 120_000; // 2 minutes margin
    return new Date().getTime() < tokenExpiration;
};

const rotateInstallationToken = async (installationId: number) => {
    // Github app config
    const appId = bootEnv.GITHUB_APP_ID;
    const privateKey = bootEnv.GITHUB_APP_PRIVATE_KEY;

    const jwt = generateAppJWT(appId, privateKey);

    const data = await githubREST(
        `https://api.github.com/app/installations/${installationId}/access_tokens`,
        jwt,
    );

    return data;
};

const findValidTokenInCache = async (installationId: number) => {
    const cached = await redis.getCache<{ token: string; expires_at: string }>(
        TOKEN_KEY(installationId),
    );
    // Case 1 (valid token): If installation has token and is valid, return it
    if (cached && isTokenValid(cached.expires_at)) {
        logger.debug('Cache has a valid token for the installation. Returning it...');
        return cached.token;
    }
};

const generateAppJWT = (appId: string, privateKey: string) => {
    if (!appId || !privateKey) throw new ValidationError('GitHub App is not configured');
    const now = Math.floor(Date.now() / 1_000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
        JSON.stringify({ iat: now - 30, exp: now + 9 * 60, iss: appId }),
    ).toString('base64url');
    const content = `${header}.${payload}`;
    return `${content}.${sign('RSA-SHA256', Buffer.from(content), privateKey).toString('base64url')}`;
};
