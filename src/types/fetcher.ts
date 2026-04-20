import { z } from 'zod';
import { FetchType } from './fetchType.js';

export interface IFetcher {
    id: string;
    type: FetchType;
    moreInfo: {
        title: string;
        description: string;
        example: string;
    };
    fetcherConfigSchema: z.ZodTypeAny;
    fetch: (fetcherConfig: Record<string, unknown>) => Promise<{ data: unknown }>;
    fetchScript?: string;
}
