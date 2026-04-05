import * as fetchResultRepository from '../repositories/fetchResult.repository.js';
import * as fetcherService from './fetchers/fetcher.service.js';
import { IFetchResult } from '../models/fetchResult.model.js';
import { FetchStatus } from '../types/fetchStatus.js';
import { FetchType } from '../types/fetchType.js';

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
            await fetchResultRepository.updateFetchResultById(initialFetchResult._id.toString(), {
                status: FetchStatus.COMPLETED,
                fetchEndDate: fetchEndDate,
                fetchDate: fetchEndDate,
                data: fetchResult.data,
            });
        } catch (error) {
            const fetchEndDate = new Date();
            await fetchResultRepository.updateFetchResultById(initialFetchResult._id.toString(), {
                status: FetchStatus.FAILED,
                fetchEndDate: fetchEndDate,
                fetchDate: fetchEndDate,
            });
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
