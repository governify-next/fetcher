import { getHeaders } from './auth.headers.util.js';

export const GITLAB_DEFAULT_URL = 'https://gitlab.com';

export const gitlabProjectPath = (projectPath: string): string =>
    `/projects/${encodeURIComponent(projectPath)}`;

export const gitlabGraphQL = async (
    baseUrl: string,
    query: string,
    token: string,
): Promise<unknown> => {
    const response = await fetch(`${baseUrl}/api/graphql`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ query }),
    });
    const body = (await response.json()) as { data?: unknown; errors?: unknown[] };
    if (body.errors?.length) {
        throw new Error(`GitLab GraphQL error: ${JSON.stringify(body.errors)}`);
    }
    return body.data;
};

export const gitlabREST = async <T>(
    baseUrl: string,
    path: string,
    query: Record<string, string>,
    token: string,
): Promise<{ data: T; nextPage: string }> => {
    const url = new URL(`${baseUrl}/api/v4${path}`);
    url.search = new URLSearchParams(query).toString();

    const response = await fetch(url, { headers: getHeaders(token) });
    if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
            message?: unknown;
            error?: unknown;
        };
        throw new Error(
            `GitLab REST error ${response.status}: ${JSON.stringify(body.message ?? body.error ?? response.statusText)}`,
        );
    }

    return {
        data: (await response.json()) as T,
        nextPage: response.headers.get('x-next-page') ?? '',
    };
};
