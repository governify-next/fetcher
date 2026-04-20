import { IFetchResult, getFetcherResultsModel } from '../models/fetchResult.model.js';

export const createFetchResultByFetcherId = async (
    fetcherId: string,
    fetchResultData: Partial<IFetchResult>,
) => {
    const FetcherResultModel = getFetcherResultsModel(fetcherId);
    const fetchResult = new FetcherResultModel(fetchResultData);
    return await fetchResult.save();
};

export const getFetchResultsByFetcherId = async (fetcherId: string) => {
    return await getFetcherResultsModel(fetcherId).find();
};

export const getFetchResultsByFetchResultBody = async (
    fetcherId: string,
    date: Date,
    fetcherConfig: Record<string, unknown>,
) => {
    return await getFetcherResultsModel(fetcherId).find({
        date,
        fetcherConfig,
    });
};

export const deleteFetchResultsByFetcherId = async (fetcherId: string) => {
    return await getFetcherResultsModel(fetcherId).deleteMany({});
};

export const getFetchResultByFetcherIdAndFetchResultId = async (
    fetcherId: string,
    fetchResultId: string,
) => {
    return await getFetcherResultsModel(fetcherId).findById(fetchResultId);
};

export const updateFetchResultByFetcherIdAndFetchResultId = async (
    fetcherId: string,
    fetchResultId: string,
    updateData: Partial<IFetchResult>,
) => {
    return await getFetcherResultsModel(fetcherId).findByIdAndUpdate(fetchResultId, updateData, {
        new: true,
    });
};

export const deleteFetchResultByFetcherIdAndFetchResultId = async (
    fetcherId: string,
    fetchResultId: string,
) => {
    return await getFetcherResultsModel(fetcherId).findByIdAndDelete(fetchResultId);
};
