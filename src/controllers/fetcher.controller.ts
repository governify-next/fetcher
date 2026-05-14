import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/standardResponse.js';
import * as fetcherService from '../services/fetchers/fetcher.service.js';

export const fetchFetcher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherId } = req.params;
        const { fetcherConfig } = req.body;
        const fetchResult = await fetcherService.fetchFetcher(fetcherId, fetcherConfig);
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

export const getFetcherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherId } = req.params;
        const fetcher = await fetcherService.getFetcherById(fetcherId);
        return sendSuccess(res, { data: fetcher, message: 'Fetcher retrieved' });
    } catch (err) {
        next(err);
    }
};

export const validateFetcher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherId } = req.params;
        const { fetcherConfig } = req.body;

        const result = await fetcherService.validateFetcher(fetcherId, fetcherConfig);
        if (!result.valid) {
            return sendSuccess(res, {
                data: result,
                message: 'Fetcher validation failed',
            });
        }
        return sendSuccess(res, { data: result, message: 'Fetcher validation passed' });
    } catch (err) {
        next(err);
    }
};
