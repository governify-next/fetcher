import { IFetcher } from '../../../../types/fetcher.js';
import { z } from 'zod';

export const FT_REST_GITHUB_COMMITS: IFetcher = {
    id: 'FT_REST_GITHUB_COMMITS',
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
        // haz que espere 10 segundos para simular una llamada a la API de GitHub
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return {
            data: [
                {
                    comments: {
                        number: 5,
                    },
                },
                {
                    comments: {
                        number: 10,
                    },
                },
                {
                    comments: {
                        number: 15,
                    },
                },
                {
                    comments: {
                        number2: 20,
                    },
                },
            ],
        };
    },
};
