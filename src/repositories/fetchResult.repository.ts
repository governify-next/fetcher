import { IFetchResult, getFetcherResultsModel } from '../models/fetchResult.model.js';

export const claimFetchResultByFetcherId = async (
    fetcherId: string,
    fetcherResultData: Partial<IFetchResult>,
) => {
    const FetchResultModel = getFetcherResultsModel(fetcherId);
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
        const existingFetchResult = await FetchResultModel.findOne({
            date: fetcherResultData.date,
            fetcherConfig: fetcherResultData.fetcherConfig,
        });

        return {
            claimedFetchResult: existingFetchResult,
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
