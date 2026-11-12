import { z } from 'zod';
import { IFetcher } from '../../../../../types/fetcher.js';
import { TemporalCapability } from '../../../../../types/temporal.js';
import {
    GITLAB_DEFAULT_URL,
    gitlabProjectPath,
    gitlabREST,
} from '../../../utils/gitlab.api.util.js';

const getItems = async (
    baseUrl: string,
    projectPath: string,
    token: string,
): Promise<unknown[]> => {
    const items: unknown[] = [];
    let page = '1';

    while (page) {
        const response = await gitlabREST<
            {
                iid: number;
                title: string;
                web_url: string;
                issue_type: string;
                created_at: string;
                closed_at: string | null;
                author: { username: string };
                assignees: { username: string }[];
                closed_by: { username: string } | null;
            }[]
        >(
            baseUrl,
            `${gitlabProjectPath(projectPath)}/issues`,
            { state: 'all', per_page: '100', page },
            token,
        );
        items.push(
            ...response.data.map((issue) => ({
                iid: issue.iid,
                title: issue.title,
                web_url: issue.web_url,
                issue_type: issue.issue_type,
                created_at: issue.created_at,
                closed_at: issue.closed_at,
                author: { username: issue.author.username },
                assignees: issue.assignees.map((assignee) => ({ username: assignee.username })),
                closed_by: issue.closed_by && { username: issue.closed_by.username },
            })),
        );
        page = response.nextPage;
    }
    return items;
};

export const FT_REST_GITLAB_ITEMS: IFetcher = {
    id: 'FT_REST_GITLAB_ITEMS',
    temporalCapability: TemporalCapability.SNAPSHOT,
    moreInfo: {
        title: 'GitLab Items Fetcher',
        description:
            'Fetches every work item of a GitLab project in any state and of any type (issue, task, incident, test case), including its URL, type, author, assignees, who closed it, and creation and close dates.',
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

        return { data: await getItems(baseUrl, projectPath, token) };
    },
};
