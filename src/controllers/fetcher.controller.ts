import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/standardResponse.js';
import * as fetcherService from '../services/fetchers/fetcher.service.js';

export const fetchFetcher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherName } = req.params;
        const { fetcherConfig } = req.body;
        const fetchResult = await fetcherService.fetchFetcher(fetcherName, fetcherConfig);
        return sendSuccess(res, { data: fetchResult, message: 'Fetcher result generated' });
    } catch (err) {
        next(err);
    }
};

export const getFetchers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fetchers = await fetcherService.getFetchers();
        return sendSuccess(res, { data: fetchers, message: 'Fetchers retrieved' });
    } catch (err) {
        next(err);
    }
};

export const getFetcherByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherName } = req.params;
        const fetcher = await fetcherService.getFetcherByName(fetcherName);
        return sendSuccess(res, { data: fetcher, message: 'Fetcher retrieved' });
    } catch (err) {
        next(err);
    }
};

export const validateFetcher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherName } = req.params;
        const { fetcherConfig } = req.body;

        const result = await fetcherService.validateFetcher(fetcherName, fetcherConfig);
        if (!result.valid) {
            return sendSuccess(res, {
                data: result,
                message: 'Fetcher validation failed',
                httpStatus: 400,
                appCode: 'VALIDATION_ERROR',
            });
        }
        return sendSuccess(res, { data: result, message: 'Fetcher validated' });
    } catch (err) {
        next(err);
    }
};
