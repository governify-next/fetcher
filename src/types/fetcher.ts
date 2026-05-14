import { z } from 'zod';

export interface IFetcher {
    id: string;
    moreInfo: {
        title: string;
        description: string;
        example: string;
    };
    fetcherConfigSchema: z.ZodTypeAny;
    fetch: (fetcherConfig: Record<string, unknown>) => Promise<{ data: unknown }>;
    fetchScript?: string;
}
