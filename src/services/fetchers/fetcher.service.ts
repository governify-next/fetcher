import { ZodError } from 'zod';
import { IFetcher } from '../../types/fetcher.js';

import { FT_REST_GITHUB_COMMITS } from './implementations/rest/rest.github.fetcher.js';
import { FT_REST_BLUEJAY_REPORTER_LOGS } from './implementations/rest/rest.bluejay.fetcher.js';
import { FT_GQL_GITHUB_PROJECTV2_ITEMS } from './implementations/gql/gql.github.projectv2Items.fetcher.js';
import { FT_GQL_GITHUB_PULL_REQUESTS } from './implementations/gql/gql.github.pullRequests.fetcher.js';
import { FT_GQL_GITHUB_ISSUES } from './implementations/gql/gql.github.issues.fetcher.js';
import { FT_GQL_ZENHUB_ISSUES } from './implementations/gql/rest.zenhub.fetcher.js';

export const fetchers: Record<string, IFetcher> = {
    FT_REST_GITHUB_COMMITS,
    FT_REST_BLUEJAY_REPORTER_LOGS,
    FT_GQL_GITHUB_PROJECTV2_ITEMS,
    FT_GQL_GITHUB_PULL_REQUESTS,
    FT_GQL_GITHUB_ISSUES,
    FT_GQL_ZENHUB_ISSUES,
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

export type FetcherId = keyof typeof fetchers;
export const getFetcherById = (id: string): IFetcher => {
    const fetcher = fetchers[id as FetcherId];
    return fetcher;
};

export const getFetchers = (): IFetcher[] => {
    return Object.values(fetchers);
};

export const fetchFetcher = async (
    id: string,
    fetcherConfig: Record<string, unknown>,
): Promise<{ data: unknown }> => {
    const fetcher = getFetcherById(id);
    return fetcher.fetch(fetcherConfig);
};

export const validateFetcher = async (
    fetcherId: string,
    fetcherConfig: Record<string, unknown>,
): Promise<FetcherValidationResponse> => {
    const fetcher = getFetcherById(fetcherId);
    if (!fetcher) {
        return {
            valid: false,
            error: `Fetcher ${fetcherId} not found`,
        };
    }
    let fetcherIssues: ZodError['issues'] = [];
    if (fetcherConfig) {
        try {
            fetcher.fetcherConfigSchema.parse(fetcherConfig);
        } catch (error) {
            if (error instanceof ZodError) {
                fetcherIssues = error.issues;
            }
        }
    }
    if (fetcherIssues.length > 0) {
        return {
            valid: false,
            error: 'Invalid fetcherConfig',
            issues: fetcherIssues,
        };
    }

    return { valid: true };
};

type FetcherValidationResponse =
    | { valid: true }
    | { valid: false; error: string; issues?: ZodError['issues'] };
