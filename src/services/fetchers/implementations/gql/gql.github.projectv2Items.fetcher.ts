import { z } from 'zod';
import { IFetcher } from '../../../../types/fetcher.js';
import { FetchType } from '../../../../types/fetchType.js';
import { githubGraphQL } from '../../utils/github.graphql.util.js';

interface GithubProject {
    id: string;
}

interface ProjectItemsPage {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: unknown[];
}

const getProjects = async (
    owner: string,
    repository: string,
    token: string,
): Promise<GithubProject[]> => {
    const query = `
    query {
      repository(owner: "${owner}", name: "${repository}") {
        projectsV2(first: 10) {
          nodes {
            id
            title
          }
        }
      }
    }`;
    const data = (await githubGraphQL(query, token)) as {
        repository: { projectsV2: { nodes: GithubProject[] } };
    };
    return data.repository.projectsV2.nodes;
};

const getProjectItems = async (projectId: string, token: string): Promise<unknown[]> => {
    const items: unknown[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
        const query = `
        query {
          node(id: "${projectId}") {
            ... on ProjectV2 {
              items(first: 100, after: ${endCursor ? `"${endCursor}"` : null}) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  fieldValues(first: 10) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name
                        field {
                          ... on ProjectV2SingleSelectField {
                            name
                          }
                        }
                      }
                    }
                  }
                  content {
                    __typename
                    ... on Issue {
                      number
                      title
                      updatedAt
                      assignees(first: 10) {
                        nodes {
                          login
                          name
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
              }
            }
          }
        }`;
        const data = (await githubGraphQL(query, token)) as {
            node: { items: ProjectItemsPage };
        };
        const page = data.node.items;
        items.push(...page.nodes);
        hasNextPage = page.pageInfo.hasNextPage;
        endCursor = page.pageInfo.endCursor;
    }
    return items;
};

export const FT_GQL_GITHUB_PROJECTV2_ITEMS: IFetcher = {
    name: 'FT_GQL_GITHUB_PROJECTV2_ITEMS',
    type: FetchType.SCREENSHOT,
    moreInfo: {
        title: 'GitHub ProjectV2 Items Fetcher',
        description:
            'Fetches every raw item from all GitHub ProjectsV2 attached to a repository, including field values, content, assignees, linked branches and closing pull requests.',
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
        const projects = await getProjects(owner, repository, token);
        const items: unknown[] = [];
        for (const project of projects) {
            const projectItems = await getProjectItems(project.id, token);
            items.push(...projectItems);
        }
        return { data: items };
    },
};
