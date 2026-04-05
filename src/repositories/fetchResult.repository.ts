import FetchResult, { IFetchResult } from '../models/fetchResult.model.js';

export const getFetchResults = async () => {
    return await FetchResult.find();
};

export const getFetchResultById = async (id: string) => {
    return await FetchResult.findById(id);
};

export const createFetchResult = async (fetchResultData: Partial<IFetchResult>) => {
    const fetchResult = new FetchResult(fetchResultData);
    return await fetchResult.save();
};

export const updateFetchResultById = async (id: string, updateData: Partial<IFetchResult>) => {
    return await FetchResult.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteFetchResultById = async (id: string) => {
    return await FetchResult.findByIdAndDelete(id);
};

export const deleteAllFetchResults = async () => {
    return await FetchResult.deleteMany({});
};

export const getFetchResultsByFetcherName = async (fetcherName: string) => {
    return await FetchResult.find({ fetcherName });
};

export const deleteFetchResultsByFetcherName = async (fetcherName: string) => {
    return await FetchResult.deleteMany({ fetcherName });
};
