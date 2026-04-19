import { z } from 'zod';
import { IFetcher } from '../../../../types/fetcher.js';
import { FetchType } from '../../../../types/fetchType.js';
import { githubGraphQL } from '../../utils/github.graphql.util.js';

interface PullRequestsPage {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: unknown[];
}

const getPullRequests = async (
    owner: string,
    repository: string,
    token: string,
): Promise<unknown[]> => {
    const pullRequests: unknown[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
        const query = `
        query {
          repository(owner: "${owner}", name: "${repository}") {
            pullRequests(first: 100, after: ${endCursor ? `"${endCursor}"` : null}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                number
                title
                body
                bodyText
                state
                baseRefName
                headRefName
                createdAt
                mergedAt
                author {
                  login
                }
                mergedBy {
                  login
                }
                comments(first: 50) {
                  nodes {
                    author {
                      login
                    }
                    bodyText
                    createdAt
                  }
                }
                reviews(first: 30) {
                  nodes {
                    state
                    createdAt
                    bodyText
                    author {
                      login
                    }
                  }
                }
              }
            }
          }
        }`;
        const data = (await githubGraphQL(query, token)) as {
            repository: { pullRequests: PullRequestsPage };
        };
        const page = data.repository.pullRequests;
        pullRequests.push(...page.nodes);
        hasNextPage = page.pageInfo.hasNextPage;
        endCursor = page.pageInfo.endCursor;
    }
    return pullRequests;
};

export const FT_GQL_GITHUB_PULL_REQUESTS: IFetcher = {
    name: 'FT_GQL_GITHUB_PULL_REQUESTS',
    type: FetchType.SCREENSHOT,
    moreInfo: {
        title: 'GitHub Pull Requests Fetcher',
        description:
            'Fetches every raw pull request of a GitHub repository, including author, mergedBy, comments and reviews with their authors and body text.',
        example: '',
    },
    fetcherConfigSchema: z.object({}),
    auditConfigSchema: z.object({
        owner: z.string(),
        repository: z.string(),
        token: z.string(),
    }),
    fetch: async (_fetchConfig, auditConfig) => {
        const { owner, repository, token } = auditConfig as {
            owner: string;
            repository: string;
            token: string;
        };
        return { data: await getPullRequests(owner, repository, token) };
    },
};
