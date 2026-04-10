import { ZodError } from 'zod';
import { IFetcher } from '../../types/fetcher.js';
import { ValidationError } from '../../utils/customErrors.js';

import { FT_REST_GITHUB_COMMITS } from './implementations/rest/rest.github.fetcher.js';
import { FT_REST_BLUEJAY_REPORTER_LOGS } from './implementations/rest/rest.bluejay.fetcher.js';

export const fetchers: Record<string, IFetcher> = {
    FT_REST_GITHUB_COMMITS,
    FT_REST_BLUEJAY_REPORTER_LOGS,
};

const injectFetchScriptStringToMetric = (
    metrics: Record<string, IFetcher>,
): Record<string, IFetcher> => {
    Object.values(metrics).forEach((metric) => {
        metric.fetchScript = metric.fetch.toString();
    });
    return metrics;
};
injectFetchScriptStringToMetric(fetchers);

export type FetcherName = keyof typeof fetchers;
export const getFetcherByName = (name: string): IFetcher => {
    const fetcher = fetchers[name as FetcherName];
    return fetcher;
};

export const getFetchers = (): IFetcher[] => {
    return Object.values(fetchers);
};

export const fetchFetcher = async (
    name: string,
    fetcherConfig: Record<string, unknown>,
    auditConfig: Record<string, unknown>,
): Promise<{ data: unknown }> => {
    const fetcher = getFetcherByName(name);
    try {
        fetcher.fetcherConfigSchema.parse(fetcherConfig);
        fetcher.auditConfigSchema.parse(auditConfig);
        return fetcher.fetch(fetcherConfig, auditConfig);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError('Invalid metric or audit configuration', {
                issues: error.issues,
            });
        }
        throw error;
    }
};

export const validateFetcher = async (
    fetcherName: string,
    fetcherConfig: Record<string, unknown>,
    auditConfig: Record<string, unknown>,
): Promise<FetcherValidationResponse> => {
    const fetcher = getFetcherByName(fetcherName);
    if (!fetcher) {
        return {
            valid: false,
            error: `Fetcher "${fetcherName}" not found`,
        };
    }
    let fetcherIssues: ZodError['issues'] = [];
    let auditIssues: ZodError['issues'] = [];
    if (fetcherConfig) {
        try {
            fetcher.fetcherConfigSchema.parse(fetcherConfig);
        } catch (error) {
            if (error instanceof ZodError) {
                fetcherIssues = error.issues;
            } else {
                throw error;
            }
        }
    }
    if (auditConfig) {
        try {
            fetcher.auditConfigSchema.parse(auditConfig);
        } catch (error) {
            if (error instanceof ZodError) {
                auditIssues = error.issues;
            } else {
                throw error;
            }
        }
    }
    if (fetcherIssues.length || auditIssues.length) {
        let errorMessage = '';

        if (fetcherIssues.length && auditIssues.length) {
            errorMessage = 'Invalid fetcherConfig and auditConfig';
        } else if (fetcherIssues.length) {
            errorMessage = 'Invalid fetcherConfig';
        } else {
            errorMessage = 'Invalid auditConfig';
        }
        return {
            valid: false,
            error: errorMessage,
            issues: [
                ...fetcherIssues.map((i) => ({ ...i, source: 'fetcherConfig' })),
                ...auditIssues.map((i) => ({ ...i, source: 'auditConfig' })),
            ],
        };
    }

    return { valid: true };
};

type FetcherValidationResponse =
    | { valid: true }
    | { valid: false; error: string; issues?: ZodError['issues'] };
