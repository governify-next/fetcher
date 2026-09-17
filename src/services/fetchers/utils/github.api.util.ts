import { getHeaders } from './auth.headers.util.js';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export const githubGraphQL = async (query: string, token: string): Promise<unknown> => {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ query }),
    });
    const body = (await response.json()) as { data?: unknown; errors?: unknown[] };
    if (body.errors?.length) {
        throw new Error(`GitHub GraphQL error: ${JSON.stringify(body.errors)}`);
    }
    return body.data;
};

export const githubREST = async (url: string, token: string) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(token),
    });
    const body = (await response.json()) as {
        token?: string;
        expires_at?: string;
        message?: string;
    };
    if (!response.ok || !body.token || !body.expires_at) {
        throw new Error(body.message ?? 'GitHub REST error');
    }
    return { token: body.token, expires_at: body.expires_at };
};
