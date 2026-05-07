import { z } from 'zod';
import { IFetcher } from '../../../../types/fetcher.js';
import { getHeaders } from '../../utils/auth.headers.util.js';
import {
    IPipeline,
    IWorkspaceRaw,
    IZenhubData,
    IZenhubIssue,
} from '../../../../types/fetchers/gql.zenhub.fetcher.js';

const ZENHUB_GRAPHQL_URL = 'https://api.zenhub.com/public/graphql';

// Llamada a la API de Zenhub

const getZenhubData = async (query: string, apiKey: string): Promise<unknown> => {
    const response = await fetch(ZENHUB_GRAPHQL_URL, {
        method: 'POST',
        headers: getHeaders(apiKey),
        body: JSON.stringify({ query }),
    });
    const body = (await response.json()) as { data?: unknown; errors?: unknown[] };

    if (body.errors?.length) {
        throw new Error(`ZenHub GraphQL error: ${JSON.stringify(body.errors)}`);
    }

    return body.data;
};

const getZenhubWorkspaceData = async (
    workspaceId: string,
    zenhubToken: string,
): Promise<IZenhubData> => {
    const workspace = await getWorkspace(workspaceId, zenhubToken);
    const pipelines: IPipeline[] = [];

    for (const pipeline of workspace.pipelinesConnection.nodes) {
        pipelines.push({
            name: pipeline.name,
            issues: await getZenhubIssuesByPipeline(pipeline.id, zenhubToken),
        });
    }

    return {
        pipelines,
        closedIssues: await getClosedIssues(workspaceId, zenhubToken),
    };
};

const getWorkspace = async (workspaceId: string, zenhubToken: string): Promise<IWorkspaceRaw> => {
    const pipelinesQuery = `
    query GetPipelines {
      workspace(id: "${workspaceId}") {
        pipelinesConnection(first:10){
          nodes{
            id
            name
          }
        }
      }
    }`;
    const data = (await getZenhubData(pipelinesQuery, zenhubToken)) as {
        workspace: IWorkspaceRaw;
    };

    return data.workspace;
};

const getZenhubIssuesByPipeline = async (
    pipelineId: string,
    zenhubToken: string,
): Promise<IZenhubIssue[]> => {
    let issues: IZenhubIssue[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
        const issuesQuery = `
        query IssuesByPipeline {
            searchIssuesByPipeline(first:100, pipelineId:"${pipelineId}", filters: {}, after: ${endCursor ? `"${endCursor}"` : null}) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                nodes {
                    number
                    title
                    updatedAt
                    createdAt
                    pullRequest
                    assignees(first:10) {
                        nodes {
                            name
                            login
                        }
                    }
                }
            }
        }`;

        const response = (await getZenhubData(issuesQuery, zenhubToken)) as {
            searchIssuesByPipeline: {
                pageInfo: { hasNextPage: boolean; endCursor: string | null };
                nodes: IZenhubIssue[];
            };
        };
        const data = response.searchIssuesByPipeline;

        issues = issues.concat(data.nodes);
        hasNextPage = data.pageInfo.hasNextPage;
        endCursor = data.pageInfo.endCursor;
    }

    return issues.filter((issue) => !issue.pullRequest);
};

const getClosedIssues = async (
    workspaceId: string,
    zenhubToken: string,
): Promise<IZenhubIssue[]> => {
    let closedIssues: IZenhubIssue[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
        const closedIssuesQuery = `query {
            searchClosedIssues(workspaceId: "${workspaceId}", filters: {}, first: 100, after: ${endCursor ? `"${endCursor}"` : null}) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                nodes {
                    number
                    title
                    updatedAt
                    createdAt
                    pullRequest
                    assignees(first:10) {
                        nodes {
                            name
                            login
                        }
                    }
                }
            }
        }`;

        const response = (await getZenhubData(closedIssuesQuery, zenhubToken)) as {
            searchClosedIssues: {
                pageInfo: { hasNextPage: boolean; endCursor: string | null };
                nodes: IZenhubIssue[];
            };
        };
        const data = response.searchClosedIssues;

        closedIssues = closedIssues.concat(data.nodes);
        hasNextPage = data.pageInfo.hasNextPage;
        endCursor = data.pageInfo.endCursor;
    }

    return closedIssues.filter((issue) => !issue.pullRequest);
};

export const FT_GQL_ZENHUB_ISSUES: IFetcher = {
    id: 'FT_GQL_ZENHUB_ISSUES',
    moreInfo: {
        title: 'ZenHub Issues Fetcher',
        description:
            'Fetches raw ZenHub workspace data, including pipelines with issues and closed issues.',
        example: '',
    },
    fetcherConfigSchema: z.object({
        workspaceId: z.string(),
        token: z.string(),
    }),
    fetch: async (_fetcherConfig) => {
        const { workspaceId, token } = _fetcherConfig as {
            workspaceId: string;
            token: string;
        };
        return { data: await getZenhubWorkspaceData(workspaceId, token) };
    },
};
