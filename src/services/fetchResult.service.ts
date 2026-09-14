import * as fetchResultRepository from '../repositories/fetchResult.repository.js';
import * as fetcherService from './fetchers/fetcher.service.js';
import { IFetchResult } from '../models/fetchResult.model.js';
import { FetchStatus, FetchUnavailabilityReason } from '../types/fetchStatus.js';
import { getLogger } from '../utils/logger.js';
import { ITemporalContext, TemporalCapability, TemporalMode } from '../types/temporal.js';
import { hashFetcherConfig } from '../utils/canonicalJson.js';

const logger = getLogger().setTag('fetchResult.service.ts');

export const generateFetchResult = async (
    isAsync: boolean,
    fetcherId: string,
    temporalContext: ITemporalContext,
    fetcherConfig: Record<string, unknown>,
) => {
    const fetcher = fetcherService.getFetcherById(fetcherId);
    const { claimedFetchResult, shouldFetch } = await claimInitialFetchResult(
        fetcherId,
        temporalContext,
        fetcherConfig,
        fetcher.temporalCapability,
    );

    if (!claimedFetchResult || !shouldFetch) {
        return claimedFetchResult;
    }

    if (
        fetcher.temporalCapability === TemporalCapability.SNAPSHOT &&
        temporalContext.mode === TemporalMode.REPLAY
    ) {
        return await fetchResultRepository.updateFetchResultByFetcherIdAndFetchResultId(
            fetcherId,
            claimedFetchResult._id.toString(),
            {
                status: FetchStatus.UNAVAILABLE,
                endDate: new Date(),
                unavailableReason: FetchUnavailabilityReason.PAST_SNAPSHOT_NOT_CAPTURED,
            },
        );
    }

    const fetchResultAndSave = async () => {
        let fetchResult: { data: unknown };
        try {
            fetchResult = await fetcherService.fetchFetcher(
                fetcherId,
                fetcherConfig,
                temporalContext,
            );
        } catch (error) {
            logger.error(
                `Failed to generate fetch result for fetcher ${fetcherId}: ${
                    error instanceof Error ? error.message : 'Unknown fetch result error'
                }`,
            );
            return await fetchResultRepository.updateFetchResultByFetcherIdAndFetchResultId(
                fetcherId,
                claimedFetchResult!._id.toString(),
                {
                    status: FetchStatus.FAILED,
                    endDate: new Date(),
                    unavailableReason: null,
                },
            );
        }

        return await fetchResultRepository.updateFetchResultByFetcherIdAndFetchResultId(
            fetcherId,
            claimedFetchResult!._id.toString(),
            {
                status: FetchStatus.COMPLETED,
                endDate: new Date(),
                unavailableReason: null,
                data: fetchResult.data,
            },
        );
    };
    if (isAsync) {
        // Async
        void fetchResultAndSave().catch((error) => {
            logger.error(
                `Async fetch result generation failed for fetcher ${fetcherId}: ${
                    error instanceof Error ? error.message : 'Unknown fetch result error'
                }`,
            );
        });
        return claimedFetchResult;
    }
    return await fetchResultAndSave(); // Sync
};

const claimInitialFetchResult = async (
    fetcherId: string,
    temporalContext: ITemporalContext,
    fetcherConfig: Record<string, unknown>,
    temporalCapability: TemporalCapability,
) => {
    return await fetchResultRepository.claimFetchResultByFetcherId(fetcherId, {
        startDate: new Date(),
        endDate: null,
        effectiveAt: temporalContext.effectiveAt,
        status: FetchStatus.IN_PROGRESS,
        unavailableReason: null,
        temporalCapability,
        acquisitionMode: temporalContext.mode,
        fetcherConfig: fetcherConfig,
        configHash: hashFetcherConfig(fetcherConfig),
        data: null,
    });
};

export const getFetchResultsByFetcherId = async (fetcherId: string) => {
    return await fetchResultRepository.getFetchResultsByFetcherId(fetcherId);
};

export const deleteFetchResultsByFetcherId = async (fetcherId: string) => {
    return await fetchResultRepository.deleteFetchResultsByFetcherId(fetcherId);
};

export const getFetchResultByFetcherIdAndFetchResultId = async (
    fetcherId: string,
    fetchResultId: string,
) => {
    return await fetchResultRepository.getFetchResultByFetcherIdAndFetchResultId(
        fetcherId,
        fetchResultId,
    );
};

export const updateFetchResultByFetcherIdAndFetchResultId = async (
    fetcherId: string,
    fetchResultId: string,
    updateData: Partial<IFetchResult>,
) => {
    return await fetchResultRepository.updateFetchResultByFetcherIdAndFetchResultId(
        fetcherId,
        fetchResultId,
        updateData,
    );
};

export const deleteFetchResultByFetcherIdAndFetchResultId = async (
    fetcherId: string,
    fetchResultId: string,
) => {
    return await fetchResultRepository.deleteFetchResultByFetcherIdAndFetchResultId(
        fetcherId,
        fetchResultId,
    );
};
