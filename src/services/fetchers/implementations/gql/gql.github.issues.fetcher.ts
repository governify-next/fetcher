import { z } from 'zod';
import { IFetcher } from '../../../../types/fetcher.js';
import { githubGraphQL } from '../../utils/github.graphql.util.js';

export const getGithubIssues = async (
    owner: string,
    repository: string,
    token: string,
): Promise<unknown[]> => {
    const githubIssues: unknown[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
        const issuesQuery = `{
            repository(owner: "${owner}", name: "${repository}") {
                issues(first: 100, after: ${endCursor ? `"${endCursor}"` : null}) {
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                    nodes {
                        number
                        title
                        updatedAt
                        createdAt
                        assignees(first: 10) {
                            nodes {
                                name
                                login
                            }
                        }
                        linkedBranches(first: 10) {
                            nodes {
                                ref {
                                    name
                                }
                            }
                        }
                        closedByPullRequestsReferences(first: 10) {
                            nodes {
                                number
                                title
                                state
                            }
                        }
                    }
                }
            }
        }`;

        const data = (await githubGraphQL(issuesQuery, token)) as {
            repository: {
                issues: {
                    pageInfo: { hasNextPage: boolean; endCursor: string | null };
                    nodes: unknown[];
                };
            };
        };
        const page = data.repository.issues;

        githubIssues.push(...page.nodes);
        hasNextPage = page.pageInfo.hasNextPage;
        endCursor = page.pageInfo.endCursor;
    }

    return githubIssues;
};

export const FT_GQL_GITHUB_ISSUES: IFetcher = {
    id: 'FT_GQL_GITHUB_ISSUES',
    moreInfo: {
        title: 'GitHub Issues Fetcher',
        description:
            'Fetches every raw issue of a GitHub repository, including assignees, linked branches and closing pull request references.',
        example: '',
    },
    fetcherConfigSchema: z.object({
        owner: z.string(),
        repository: z.string(),
        token: z.string(),
    }),
    fetch: async (_fetcherConfig) => {
        const { owner, repository, token } = _fetcherConfig as {
            owner: string;
            repository: string;
            token: string;
        };

        return { data: await getGithubIssues(owner, repository, token) };
    },
};
