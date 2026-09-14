import { z } from 'zod';
import { TemporalCapability } from './temporal.js';

export interface IFetcher {
    id: string;
    temporalCapability: TemporalCapability;
    moreInfo: {
        title: string;
        description: string;
        example: string;
    };
    fetcherConfigSchema: z.ZodTypeAny;
    fetch: (
        fetcherConfig: Record<string, unknown>,
        effectiveAt: Date,
    ) => Promise<{ data: unknown }>;
    fetchScript?: string;
}
