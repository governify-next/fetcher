import * as fetchResultRepository from '../repositories/fetchResult.repository.js';
import * as fetcherService from './fetchers/fetcher.service.js';
import { IFetchResult } from '../models/fetchResult.model.js';
import { FetchStatus } from '../types/fetchStatus.js';
import { FetchType } from '../types/fetchType.js';
import { ComputationError } from '../utils/customErrors.js';

export const generateFetchResult = async (
    isAsync: boolean,
    partialFetchResult: Partial<IFetchResult>,
    fetcherName: string,
    fetcherConfig: Record<string, unknown>,
    auditConfig: Record<string, unknown>,
) => {
    const initialFetchResult = await createInitialFetchResult(partialFetchResult);
    const fetchResultAndSave = async () => {
        try {
            const fetchResult = await fetcherService.fetchFetcher(
                fetcherName,
                fetcherConfig,
                auditConfig,
            );
            const fetchEndDate = new Date();
            return await fetchResultRepository.updateFetchResultById(
                initialFetchResult._id.toString(),
                {
                    status: FetchStatus.COMPLETED,
                    fetchEndDate: fetchEndDate,
                    fetchDate: fetchEndDate,
                    data: fetchResult.data,
                },
            );
        } catch (error) {
            const fetchEndDate = new Date();
            await fetchResultRepository.updateFetchResultById(initialFetchResult._id.toString(), {
                status: FetchStatus.FAILED,
                fetchEndDate: fetchEndDate,
                fetchDate: fetchEndDate,
            });
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

const createInitialFetchResult = async (data: Partial<IFetchResult>) => {
    return await fetchResultRepository.createFetchResult({
        fetcherName: data.fetcherName,
        fetchStartDate: new Date(),
        fetchEndDate: null,
        fetchDate: null,
        fetchType: FetchType.SCREENSHOT,
        status: FetchStatus.IN_PROGRESS,
        auditConfig: data.auditConfig,
        fetcherConfig: data.fetcherConfig,
        data: null,
    });
};

export const getFetchResults = async () => {
    return await fetchResultRepository.getFetchResults();
};

export const getFetchResultById = async (id: string) => {
    return await fetchResultRepository.getFetchResultById(id);
};

export const updateFetchResultById = async (id: string, updateData: Partial<IFetchResult>) => {
    return await fetchResultRepository.updateFetchResultById(id, updateData);
};

export const deleteFetchResultById = async (id: string) => {
    return await fetchResultRepository.deleteFetchResultById(id);
};

export const deleteFetchResults = async () => {
    return await fetchResultRepository.deleteFetchResults();
};

export const getFetchResultsByFetcherName = async (fetcherName: string) => {
    return await fetchResultRepository.getFetchResultsByFetcherName(fetcherName);
};

export const deleteFetchResultsByFetcherName = async (fetcherName: string) => {
    return await fetchResultRepository.deleteFetchResultsByFetcherName(fetcherName);
};
