import { IFetchResult, getFetcherResultsModel } from '../models/fetchResult.model.js';
import { FetchStatus } from '../types/fetchStatus.js';

export const claimFetchResultByFetcherId = async (
    fetcherId: string,
    fetcherResultData: Partial<IFetchResult>,
) => {
    const FetchResultModel = getFetcherResultsModel(fetcherId);

    const key = {
        effectiveAt: fetcherResultData.effectiveAt,
        configHash: fetcherResultData.configHash,
    };

    const existingFetchResult = await FetchResultModel.findOne(key);
    if (existingFetchResult) {
        if (existingFetchResult.status !== FetchStatus.FAILED) {
            return {
                claimedFetchResult: existingFetchResult,
                shouldFetch: false,
            };
        }

        const retriedFetchResult = await FetchResultModel.findOneAndUpdate(
            { ...key, status: FetchStatus.FAILED },
            { $set: fetcherResultData },
            { new: true },
        );

        if (retriedFetchResult) {
            return {
                claimedFetchResult: retriedFetchResult,
                shouldFetch: true,
            };
        }

        return {
            claimedFetchResult: await FetchResultModel.findOne(key),
            shouldFetch: false,
        };
    }

    try {
        const fetchResult = new FetchResultModel(fetcherResultData);
        const createdFetchResult = await fetchResult.save();

        return {
            claimedFetchResult: createdFetchResult,
            shouldFetch: true,
        };
    } catch (error) {
        // Cualquier error que no sea de duplicación se devuelve para el controlador
        if ((error as { code?: number }).code !== 11000) {
            throw error;
        }
        // Ya existe el fetchResult en BD, buscar y devolver
        const concurrentFetchResult = await FetchResultModel.findOne(key);

        return {
            claimedFetchResult: concurrentFetchResult,
            shouldFetch: false,
        };
    }
};

export const getFetchResultsByFetcherId = async (fetcherId: string) => {
    return await getFetcherResultsModel(fetcherId).find();
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
