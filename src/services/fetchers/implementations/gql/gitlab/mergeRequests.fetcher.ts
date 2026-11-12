import { z } from 'zod';
import { IFetcher } from '../../../../../types/fetcher.js';
import { TemporalCapability } from '../../../../../types/temporal.js';
import { GITLAB_DEFAULT_URL, gitlabGraphQL } from '../../../utils/gitlab.api.util.js';

const getMergeRequests = async (
    baseUrl: string,
    projectPath: string,
    token: string,
): Promise<unknown[]> => {
    const mergeRequests: unknown[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
        const query = `
        query {
          project(fullPath: "${projectPath}") {
            mergeRequests(first: 100, after: ${endCursor ? `"${endCursor}"` : null}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                iid
                title
                webUrl
                createdAt
                mergedAt
                closedAt
                author {
                  username
                }
                notes(first: 100) {
                  nodes {
                    body
                    createdAt
                    system
                    author {
                      username
                    }
                    systemNoteMetadata {
                      action
                    }
                  }
                }
              }
            }
          }
        }`;
        const data = (await gitlabGraphQL(baseUrl, query, token)) as {
            project: {
                mergeRequests: {
                    pageInfo: { hasNextPage: boolean; endCursor: string | null };
                    nodes: unknown[];
                };
            };
        };
        const page = data.project.mergeRequests;
        mergeRequests.push(...page.nodes);
        hasNextPage = page.pageInfo.hasNextPage;
        endCursor = page.pageInfo.endCursor;
    }
    return mergeRequests;
};

export const FT_GQL_GITLAB_MERGE_REQUESTS: IFetcher = {
    id: 'FT_GQL_GITLAB_MERGE_REQUESTS',
    temporalCapability: TemporalCapability.HISTORICAL,
    moreInfo: {
        title: 'GitLab Merge Requests Fetcher',
        description:
            'Fetches every raw merge request of a GitLab project, including its URL, author, creation, merge and close dates, and notes with their authors, body and system note action.',
        example: '',
    },
    fetcherConfigSchema: z.object({
        baseUrl: z.url().default(GITLAB_DEFAULT_URL),
        projectPath: z.string(),
        token: z.string(),
    }),
    fetch: async (fetcherConfig) => {
        const {
            baseUrl = GITLAB_DEFAULT_URL,
            projectPath,
            token,
        } = fetcherConfig as {
            baseUrl?: string;
            projectPath: string;
            token: string;
        };

        return { data: await getMergeRequests(baseUrl, projectPath, token) };
    },
};
