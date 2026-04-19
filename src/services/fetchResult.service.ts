import * as fetchResultRepository from '../repositories/fetchResult.repository.js';
import * as fetcherService from './fetchers/fetcher.service.js';
import { IFetchResult } from '../models/fetchResult.model.js';
import { FetchStatus } from '../types/fetchStatus.js';
import { ComputationError } from '../utils/customErrors.js';

export const generateFetchResult = async (
    isAsync: boolean,
    partialFetchResult: Partial<IFetchResult>,
    fetcherName: string,
    fetcherConfig: Record<string, unknown>,
) => {
    const initialFetchResult = await createInitialFetchResult(fetcherName, partialFetchResult);
    const fetchResultAndSave = async () => {
        try {
            const fetchResult = await fetcherService.fetchFetcher(fetcherName, fetcherConfig);
            return await fetchResultRepository.updateFetchResultByFetcherNameAndId(
                fetcherName,
                initialFetchResult._id.toString(),
                {
                    status: FetchStatus.COMPLETED,
                    endDate: new Date(),
                    data: fetchResult.data,
                },
            );
        } catch (error) {
            await fetchResultRepository.updateFetchResultByFetcherNameAndId(
                fetcherName,
                initialFetchResult._id.toString(),
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
        return initialFetchResult;
    }
    return await fetchResultAndSave(); // Sync
};

const createInitialFetchResult = async (fetcherName: string, data: Partial<IFetchResult>) => {
    return await fetchResultRepository.createFetchResultByFetcherName(fetcherName, {
        startDate: new Date(),
        endDate: null,
        date: data.date,
        status: FetchStatus.IN_PROGRESS,
        fetcherConfig: data.fetcherConfig,
        data: null,
    });
};

export const getFetchResultsByFetcherName = async (fetcherName: string) => {
    return await fetchResultRepository.getFetchResultsByFetcherName(fetcherName);
};

export const getFetchResultsByFetchResultBody = async (
    fetcherName: string,
    date: Date,
    fetcherConfig: Record<string, unknown>,
) => {
    return await fetchResultRepository.getFetchResultsByFetchResultBody(
        fetcherName,
        date,
        fetcherConfig,
    );
};

export const deleteFetchResultsByFetcherName = async (fetcherName: string) => {
    return await fetchResultRepository.deleteFetchResultsByFetcherName(fetcherName);
};

export const getFetchResultByFetcherNameAndId = async (fetcherName: string, id: string) => {
    return await fetchResultRepository.getFetchResultByFetcherNameAndId(fetcherName, id);
};

export const updateFetchResultByFetcherNameAndId = async (
    fetcherName: string,
    id: string,
    updateData: Partial<IFetchResult>,
) => {
    return await fetchResultRepository.updateFetchResultByFetcherNameAndId(
        fetcherName,
        id,
        updateData,
    );
};

export const deleteFetchResultByFetcherNameAndId = async (fetcherName: string, id: string) => {
    return await fetchResultRepository.deleteFetchResultByFetcherNameAndId(fetcherName, id);
};
