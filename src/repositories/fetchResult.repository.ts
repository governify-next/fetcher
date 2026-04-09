import { IFetchResult, getFetcherResultsModel } from '../models/fetchResult.model.js';
import { FetchStatus } from '../types/fetchStatus.js';

export const createFetchResultByFetcherName = async (
    fetcherName: string,
    fetchResultData: Partial<IFetchResult>,
) => {
    const FetcherResultModel = getFetcherResultsModel(fetcherName);
    const fetchResult = new FetcherResultModel(fetchResultData);
    return await fetchResult.save();
};

export const getFetchResultsByFetcherName = async (fetcherName: string) => {
    return await getFetcherResultsModel(fetcherName).find();
};

export const getFetchResultsByFetchResultBody = async (
    fetcherName: string,
    fetchDate: Date,
    auditConfig: Record<string, unknown>,
    fetcherConfig: Record<string, unknown>,
) => {
    return await getFetcherResultsModel(fetcherName).find({
        fetchDate,
        auditConfig,
        fetcherConfig,
    });
};

export const deleteFetchResultsByFetcherName = async (fetcherName: string) => {
    return await getFetcherResultsModel(fetcherName).deleteMany({});
};

export const getFetchResultByFetcherNameAndId = async (fetcherName: string, id: string) => {
    return await getFetcherResultsModel(fetcherName).findById(id);
};

export const updateFetchResultByFetcherNameAndId = async (
    fetcherName: string,
    id: string,
    updateData: Partial<IFetchResult>,
) => {
    return await getFetcherResultsModel(fetcherName).findByIdAndUpdate(id, updateData, {
        new: true,
    });
};

export const deleteFetchResultByFetcherNameAndId = async (fetcherName: string, id: string) => {
    return await getFetcherResultsModel(fetcherName).findByIdAndDelete(id);
};
