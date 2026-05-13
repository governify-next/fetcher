import * as fetchResultRepository from '../repositories/fetchResult.repository.js';
import * as fetcherService from './fetchers/fetcher.service.js';
import { IFetchResult } from '../models/fetchResult.model.js';
import { FetchStatus } from '../types/fetchStatus.js';
import { ComputationError } from '../utils/customErrors.js';

export const generateFetchResult = async (
    isAsync: boolean,
    fetcherId: string,
    date: Date,
    fetcherConfig: Record<string, unknown>,
) => {
    const { claimedFetchResult, shouldFetch } = await claimInitialFetchResult(
        fetcherId,
        date,
        fetcherConfig,
    );

    if (!shouldFetch) {
        return claimedFetchResult;
    }

    const fetchResultAndSave = async () => {
        try {
            const fetchResult = await fetcherService.fetchFetcher(fetcherId, fetcherConfig);
            return await fetchResultRepository.updateFetchResultByFetcherIdAndFetchResultId(
                fetcherId,
                claimedFetchResult!._id.toString(),
                {
                    status: FetchStatus.COMPLETED,
                    endDate: new Date(),
                    data: fetchResult.data,
                },
            );
        } catch (error) {
            await fetchResultRepository.updateFetchResultByFetcherIdAndFetchResultId(
                fetcherId,
                claimedFetchResult!._id.toString(),
                {
                    status: FetchStatus.FAILED,
                    endDate: new Date(),
                },
            );
            throw new ComputationError('Failed to generate fetch result');
        }
    };
    if (isAsync) {
        // Async
        void fetchResultAndSave();
        return claimedFetchResult;
    }
    return await fetchResultAndSave(); // Sync
};

const claimInitialFetchResult = async (
    fetcherId: string,
    date: Date,
    fetcherConfig: Record<string, unknown>,
) => {
    return await fetchResultRepository.claimFetchResultByFetcherId(fetcherId, {
        startDate: new Date(),
        endDate: null,
        date: date,
        status: FetchStatus.IN_PROGRESS,
        fetcherConfig: fetcherConfig,
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
