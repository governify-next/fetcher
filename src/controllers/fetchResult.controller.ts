import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/standardResponse.js';
import * as fetchResultService from '../services/fetchResult.service.js';
import { IFetchResult } from '../models/fetchResult.model.js';

export const generateFetchResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherId } = req.params;
        const { date, fetcherConfig } = req.body;
        const existingFetchResult =
            await fetchResultService.getFetchResultsByFetcherIdAndFetchResultBody(
                fetcherId,
                date,
                fetcherConfig,
            );

        if (existingFetchResult.length > 0) {
            return sendSuccess(res, {
                data: existingFetchResult[0],
                message:
                    'A fetch result already exists for the provided fetcherId, fetch date and fetcher configuration. Returning existing result',
                httpStatus: 200,
                appCode: 'DUPLICATE_KEY',
            });
        }
        const isAsync = req.query.isAsync === 'true';
        const fetchResult = await fetchResultService.generateFetchResult(
            isAsync,
            fetcherId,
            date,
            fetcherConfig,
        );

        return sendSuccess(res, {
            data: fetchResult,
            message: isAsync ? 'Fetch result started asynchronously' : 'Fetch result generated',
        });
    } catch (err) {
        next(err);
    }
};

export const getFetchResultsByFetcherId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { fetcherId } = req.params;
        const fetchResults = await fetchResultService.getFetchResultsByFetcherId(fetcherId);
        return sendSuccess(res, { data: fetchResults, message: 'Fetch results retrieved' });
    } catch (err) {
        next(err);
    }
};

export const deleteFetchResultsByFetcherId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { fetcherId } = req.params;
        const deletedFetchResults =
            await fetchResultService.deleteFetchResultsByFetcherId(fetcherId);
        return sendSuccess(res, { data: deletedFetchResults, message: 'Fetch results deleted' });
    } catch (err) {
        next(err);
    }
};

export const getFetchResultByFetcherIdAndFetchResultId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { fetchResultId, fetcherId } = req.params;
        const fetchResult = await fetchResultService.getFetchResultByFetcherIdAndFetchResultId(
            fetcherId,
            fetchResultId,
        );
        return sendSuccess(res, { data: fetchResult, message: 'Fetch result retrieved' });
    } catch (err) {
        next(err);
    }
};

export const updateFetchResultByFetcherIdAndFetchResultId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { fetchResultId, fetcherId } = req.params;
        const updateData: Partial<IFetchResult> = req.body;
        const updatedFetchResult =
            await fetchResultService.updateFetchResultByFetcherIdAndFetchResultId(
                fetcherId,
                fetchResultId,
                updateData,
            );
        return sendSuccess(res, { data: updatedFetchResult, message: 'Fetch result updated' });
    } catch (err) {
        next(err);
    }
};

export const deleteFetchResultByFetcherIdAndFetchResultId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { fetchResultId, fetcherId } = req.params;
        const deletedFetchResult =
            await fetchResultService.deleteFetchResultByFetcherIdAndFetchResultId(
                fetcherId,
                fetchResultId,
            );
        return sendSuccess(res, { data: deletedFetchResult, message: 'Fetch result deleted' });
    } catch (err) {
        next(err);
    }
};
