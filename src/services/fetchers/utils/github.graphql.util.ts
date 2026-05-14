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
