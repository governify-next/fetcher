import { Model } from 'mongoose';
import {
    IFetchResult,
    IFetchResultData,
    getFetcherResultsModel,
} from '../models/fetchResult.model.js';
import { IFetchResultKey } from '../types/fetchResultKey.js';
import { FetchStatus } from '../types/fetchStatus.js';
import { TemporalCapability } from '../types/temporal.js';

export const claimFetchResultByFetcherId = async (
    fetcherId: string,
    fetcherResultData: IFetchResultData,
) => {
    const FetchResultModel = getFetcherResultsModel(fetcherId);

    const key =
        fetcherResultData.temporalCapability === TemporalCapability.HISTORICAL
            ? { configHash: fetcherResultData.configHash }
            : {
                  effectiveAt: fetcherResultData.effectiveAt,
                  configHash: fetcherResultData.configHash,
              };

    const existingFetchResult = await FetchResultModel.findOne(key);
    if (existingFetchResult) {
        if (existingFetchResult.status === FetchStatus.FAILED) {
            // FAILED snapshot or historical fetchResult needs a retry
            return await findAndUpdateClaimWithConcurrency(
                FetchResultModel,
                fetcherResultData,
                key,
                FetchStatus.FAILED,
            );
        }

        // invalid COMPLETED historical fetchResult
        const needsRefresh =
            fetcherResultData.temporalCapability === TemporalCapability.HISTORICAL &&
            existingFetchResult.status === FetchStatus.COMPLETED &&
            existingFetchResult.effectiveAt < fetcherResultData.effectiveAt;

        if (needsRefresh) {
            return await findAndUpdateClaimWithConcurrency(
                FetchResultModel,
                fetcherResultData,
                key,
                FetchStatus.COMPLETED,
            );
        }

        // snapshot or valid historical COMPLETED/IN_PROGRESS fetchResult
        return {
            claimedFetchResult: existingFetchResult,
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

const findAndUpdateClaimWithConcurrency = async (
    FetchResultModel: Model<IFetchResult>,
    fetcherResultData: IFetchResultData,
    key: IFetchResultKey,
    expectedStatus: FetchStatus,
) => {
    const { data, ...basicFetcherResultData } = fetcherResultData;
    const updatedFetchResult = await FetchResultModel.findOneAndUpdate(
        { ...key, status: expectedStatus },
        { $set: basicFetcherResultData },
        { new: true },
    );
    if (updatedFetchResult) {
        return {
            claimedFetchResult: updatedFetchResult,
            shouldFetch: true,
        };
    }
    // Concurrency call, need to find updated fetchResult
    return {
        claimedFetchResult: await FetchResultModel.findOne(key),
        shouldFetch: false,
    };
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
