import { z } from 'zod';
import { IFetcher } from '../../../../../types/fetcher.js';
import { TemporalCapability } from '../../../../../types/temporal.js';
import {
    GITLAB_DEFAULT_URL,
    gitlabGraphQL,
    gitlabProjectPath,
    gitlabREST,
} from '../../../utils/gitlab.api.util.js';

type GitlabCommit = {
    id: string;
    title: string;
    web_url: string;
    parent_ids: string[];
    author_name: string;
    author_email: string;
    authored_date: string;
    committed_date: string;
    stats: { additions: number; deletions: number };
};

const getCommits = async (
    baseUrl: string,
    projectPath: string,
    token: string,
): Promise<GitlabCommit[]> => {
    const commits: GitlabCommit[] = [];
    let page = '1';

    while (page) {
        const response = await gitlabREST<GitlabCommit[]>(
            baseUrl,
            `${gitlabProjectPath(projectPath)}/repository/commits`,
            { all: 'true', with_stats: 'true', per_page: '100', page },
            token,
        );
        commits.push(
            ...response.data.map((commit) => ({
                id: commit.id,
                title: commit.title,
                web_url: commit.web_url,
                parent_ids: commit.parent_ids,
                author_name: commit.author_name,
                author_email: commit.author_email,
                authored_date: commit.authored_date,
                committed_date: commit.committed_date,
                stats: { additions: commit.stats.additions, deletions: commit.stats.deletions },
            })),
        );
        page = response.nextPage;
    }
    return commits;
};

const getUsernamesByEmail = async (
    baseUrl: string,
    projectPath: string,
    token: string,
    commits: GitlabCommit[],
): Promise<Record<string, string>> => {
    const shaByEmail = Object.fromEntries(
        commits.map((commit) => [commit.author_email, commit.id]),
    );
    const emails = Object.keys(shaByEmail);

    const query = `
    query {
      project(fullPath: "${projectPath}") {
        repository {
          ${emails.map((email, index) => `e${index}: commit(ref: "${shaByEmail[email]}") { author { username } }`).join('\n')}
        }
      }
    }`;
    const data = (await gitlabGraphQL(baseUrl, query, token)) as {
        project: { repository: Record<string, { author: { username: string } | null }> };
    };

    return Object.fromEntries(
        emails.map((email, index) => [
            email,
            data.project.repository[`e${index}`].author?.username ?? '',
        ]),
    );
};

export const FT_REST_GITLAB_COMMITS: IFetcher = {
    id: 'FT_REST_GITLAB_COMMITS',
    temporalCapability: TemporalCapability.HISTORICAL,
    moreInfo: {
        title: 'GitLab Commits Fetcher',
        description:
            'Fetches every commit of a GitLab project across all branches, including its SHA, title, URL, parent SHAs, author name and email, authored and committed dates, and line stats (additions, deletions). Each commit also gets the username of the GitLab user that owns its author email (empty if no user owns it).',
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

        const commits = await getCommits(baseUrl, projectPath, token);
        if (!commits.length) {
            return { data: [] };
        }
        const usernameByEmail = await getUsernamesByEmail(baseUrl, projectPath, token, commits);

        return {
            data: commits.map((commit) => ({
                ...commit,
                username: usernameByEmail[commit.author_email],
            })),
        };
    },
};
