import { z } from 'zod';

export interface IFetcher {
    name: string;
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
