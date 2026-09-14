import { sign } from 'node:crypto';
import { bootEnv } from '../../../config/bootConfig.js';
import { ValidationError } from '../../../utils/customErrors.js';
import { githubREST } from './github.api.util.js';
import { getLogger } from '../../../utils/logger.js';

const logger = getLogger('github.installationToken');

// Cache of installation tokens and rotation status
const installationCache = new Map<number, { token: string; expires_at: string }>();
const inflightRotations = new Map<number, Promise<string>>();

export const getInstallationToken = async (installationId: number) => {
    logger.info(`Getting installation token for installation with ID: ${installationId}.`);
    const cached = installationCache.get(installationId);
    // Case 1 (valid token): If installation has token and is valid, return it
    if (cached && isTokenValid(cached.expires_at)) {
        logger.info('Cache has a valid token for the installation. Returning it...');
        return cached.token;
    }

    // Case 2 (not valid, not creator): If installation has no token or is invalid, but Promise of rotation exists, return promise and wait for resolution
    const inflight = inflightRotations.get(installationId);
    if (inflight) {
        logger.info(
            `Need to generate a new token for the installation with ID ${installationId}. Waiting for resolution...`,
        );
        return inflight; // The await will be resolved when the rotation is complete
    }

    // Case 3 (not valid, creator): Token not valid, but no promise of rotation exists. Rotate token and delete promise when complete
    const rotation = (async () => {
        logger.info(
            `Need to generate a new token for the installation with ID ${installationId}. Rotating token...`,
        );
        const { token, expires_at } = await rotateInstallationToken(installationId);
        installationCache.set(installationId, { token, expires_at });
        logger.info(
            `New token generated and cached for the installation with ID ${installationId}. Token expires at ${expires_at}.`,
        );
        return token;
    })().finally(() => {
        inflightRotations.delete(installationId);
        logger.info(
            `Promise of rotation for the installation with ID ${installationId} deleted successfully.`,
        );
    });
    logger.info(`Setting promise of rotation for the installation with ID ${installationId}...`);
    inflightRotations.set(installationId, rotation);
    return rotation;
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
