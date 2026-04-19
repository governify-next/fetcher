import { IFetcher } from '../../../../types/fetcher.js';
import { FetchType } from '../../../../types/fetchType.js';
import { z } from 'zod';

export const FT_REST_GITHUB_COMMITS: IFetcher = {
    name: 'FT_REST_GITHUB_COMMITS',
    type: FetchType.SCREENSHOT,
    moreInfo: {
        title: 'GitHub Fetcher',
        description:
            'Fetches data from GitHub repositories, including commits, issues, and pull requests.',
        example: '',
    },
    fetcherConfigSchema: z.object({
        owner: z.string(),
        repository: z.string(),
    }),
    fetch: async (_fetchConfig) => {
        return { data: 'This is a placeholder for GitHub fetcher data' };
    },
};
