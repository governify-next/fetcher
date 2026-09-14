import { z } from 'zod';
import { IFetcher } from '../../../../types/fetcher.js';
import { TemporalCapability } from '../../../../types/temporal.js';
import { githubGraphQL } from '../../utils/github.graphql.util.js';

const getBasicProjectItems = async (projectId: string, token: string) => {
    const items = [];
    let hasNextPage = true;
    let endCursor = null;

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
                  fieldValueByName(name: "Status") {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                        status: name
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
                        }
                      }
                      issueType {
                        name
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
            node: {
                items: {
                    nodes: unknown[];
                    pageInfo: {
                        hasNextPage: boolean;
                        endCursor: string | null;
                    };
                };
            };
        };
        const page = data.node.items;
        items.push(...page.nodes);
        hasNextPage = page.pageInfo.hasNextPage;
        endCursor = page.pageInfo.endCursor;
    }
    return items;
};

const getProjectItems = async (projectId: string, token: string) => {
    const items = [];
    let endCursor = null;
    let hasNextPage = true;

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
                    content {
                      __typename
                      ... on Issue {
                        number
                        url
                        title
                        timelineItems(first: 100, itemTypes: [PROJECT_V2_ITEM_STATUS_CHANGED_EVENT, ASSIGNED_EVENT, UNASSIGNED_EVENT, ISSUE_TYPE_ADDED_EVENT, ISSUE_TYPE_CHANGED_EVENT, ISSUE_TYPE_REMOVED_EVENT, CONNECTED_EVENT, DISCONNECTED_EVENT]) {
                          nodes {
                            __typename
                            ... on ProjectV2ItemStatusChangedEvent {
                              createdAt
                              previousStatus
                              status
                            }
                            ... on AssignedEvent {
                              createdAt
                              assignee {
                                __typename
                                ... on User {
                                  login
                                }
                              }
                            }
                            ... on UnassignedEvent {
                              createdAt
                              assignee {
                                __typename
                                ... on User {
                                  login
                                }
                              }
                            }
                            ... on IssueTypeAddedEvent {
                                createdAt
                                issueType {
                                    name
                                }
                            }
                            ... on IssueTypeRemovedEvent {
                                createdAt
                                issueType {
                                    name
                                }
                            }
                            ... on IssueTypeChangedEvent {
                                createdAt
                                issueType {
                                    name
                                }
                            }
                            ... on ConnectedEvent {
                                createdAt
                                subject {
                                    __typename
                                    ... on PullRequest {
                                        number
                                        closedAt
                                        mergedAt
                                    }
                                }
                            }
                            ... on DisconnectedEvent {
                                createdAt
                                subject {
                                    __typename
                                    ... on PullRequest {
                                        number
                                        closedAt
                                        mergedAt
                                    }
                                }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const data = (await githubGraphQL(query, token)) as {
            node: {
                items: {
                    nodes: unknown[];
                    pageInfo: {
                        hasNextPage: boolean;
                        endCursor: string | null;
                    };
                };
            };
        };
        const page = data.node.items;
        items.push(...page.nodes);
        hasNextPage = page.pageInfo.hasNextPage;
        endCursor = page.pageInfo.endCursor;
    }

    return items;
};

export const FT_GQL_GITHUB_PROJECTV2_ITEMS_BASIC: IFetcher = {
    id: 'FT_GQL_GITHUB_PROJECTV2_ITEMS_BASIC',
    temporalCapability: TemporalCapability.SNAPSHOT,
    moreInfo: {
        title: 'GitHub ProjectV2 Basic Items Fetcher',
        description:
            'Fetches every raw item from all GitHub ProjectsV2 attached to a repository, including field values, content, assignees, linked branches and closing pull requests, without historical information.',
        example: '',
    },
    fetcherConfigSchema: z.object({
        projectIds: z.array(z.string()),
        token: z.string(),
    }),
    fetch: async (fetcherConfig) => {
        const { projectIds, token } = fetcherConfig as {
            projectIds: string[];
            token: string;
        };
        const items = [];
        for (const projectId of projectIds) {
            const projectItems = await getBasicProjectItems(projectId, token);
            items.push(...projectItems);
        }
        return { data: items };
    },
};

export const FT_GQL_GITHUB_PROJECTV2_ITEMS: IFetcher = {
    id: 'FT_GQL_GITHUB_PROJECTV2_ITEMS',
    temporalCapability: TemporalCapability.HISTORICAL,
    moreInfo: {
        title: 'GitHub ProjectV2 Items Fetcher',
        description:
            'Fetches every item from GitHub ProjectV2 boards associated to the given repository, including basic and historical information with assignees and issue type.',
        example: '',
    },
    fetcherConfigSchema: z.object({
        projectIds: z.array(z.string()),
        token: z.string(),
    }),
    fetch: async (fetcherConfig) => {
        const { projectIds, token } = fetcherConfig as {
            projectIds: string[];
            token: string;
        };
        const items = [];
        for (const projectId of projectIds) {
            const projectItems = await getProjectItems(projectId, token);
            items.push(...projectItems);
        }
        return { data: items };
    },
};
