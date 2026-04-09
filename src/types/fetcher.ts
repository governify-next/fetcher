import { z } from 'zod';
import { FetchType } from './fetchType.js';

export interface IFetcher {
    name: string;
    type: FetchType;
    moreInfo: {
        title: string;
        description: string;
        example: string;
    };
    fetcherConfigSchema: z.ZodTypeAny;
    auditConfigSchema: z.ZodTypeAny;
    fetch: (
        fetcherConfig: Record<string, unknown>,
        auditConfig: Record<string, unknown>,
    ) => Promise<{ data: unknown }>;
    fetchScript?: string;
}
