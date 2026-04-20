import { IFetcher } from '../../../../types/fetcher.js';
import { FetchType } from '../../../../types/fetchType.js';
import { z } from 'zod';

export const FT_REST_BLUEJAY_REPORTER_LOGS: IFetcher = {
    id: 'FT_REST_BLUEJAY_REPORTER_LOGS',
    type: FetchType.SCREENSHOT,
    moreInfo: {
        title: 'Reporter Logs Fetcher',
        description: 'Fetches reporter logs from the Bluejay system.',
        example: '',
    },
    fetcherConfigSchema: z.object({}),
    fetch: async (_fetchConfig) => {
        const response = await fetch('https://reporter.bluejay.governify.io/telemetry/logs');
        const data = await response.json();
        return { data };
    },
};
