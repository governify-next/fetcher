import e, { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/standardResponse.js';
import * as fetchResultService from '../services/fetchResult.service.js';
import { IFetchResult } from '../models/fetchResult.model.js';

export const generateFetchResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherName } = req.params;
        const { fetcherConfig, auditConfig } = req.body;
        const isAsync = req.query.isAsync === 'true';
        const partialFetchResult: Partial<IFetchResult> = {
            fetcherName,
            fetcherConfig,
            auditConfig,
        };
        const fetchResult = await fetchResultService.generateFetchResult(
            isAsync,
            partialFetchResult,
            fetcherName,
            fetcherConfig,
            auditConfig,
        );

        return sendSuccess(res, {
            data: fetchResult,
            message: isAsync ? 'Fetch result created' : 'Fetch result created and generated',
        });
    } catch (err) {
        next(err);
    }
};

export const getFetchResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fetchResults = await fetchResultService.getFetchResults();
        return sendSuccess(res, { data: fetchResults, message: 'Fetch results retrieved' });
    } catch (err) {
        next(err);
    }
};

export const getFetchResultById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const fetchResult = await fetchResultService.getFetchResultById(id);
        return sendSuccess(res, { data: fetchResult, message: 'Fetch result retrieved' });
    } catch (err) {
        next(err);
    }
};

export const updateFetchResultById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData: Partial<IFetchResult> = req.body;
        const updatedFetchResult = await fetchResultService.updateFetchResultById(id, updateData);
        return sendSuccess(res, { data: updatedFetchResult, message: 'Fetch result updated' });
    } catch (err) {
        next(err);
    }
};

export const deleteFetchResultById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deletedFetchResult = await fetchResultService.deleteFetchResultById(id);
        return sendSuccess(res, { data: deletedFetchResult, message: 'Fetch result deleted' });
    } catch (err) {
        next(err);
    }
};

export const deleteAllFetchResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedFetchResults = await fetchResultService.deleteFetchResults();
        return sendSuccess(res, {
            data: deletedFetchResults,
            message: 'All fetch results deleted',
        });
    } catch (err) {
        next(err);
    }
};

export const getFetchResultsByFetcherName = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { fetcherName } = req.params;
        const fetchResults = await fetchResultService.getFetchResultsByFetcherName(fetcherName);
        return sendSuccess(res, { data: fetchResults, message: 'Fetch results retrieved' });
    } catch (err) {
        next(err);
    }
};

export const deleteFetchResultsByFetcherName = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { fetcherName } = req.params;
        const deletedFetchResults =
            await fetchResultService.deleteFetchResultsByFetcherName(fetcherName);
        return sendSuccess(res, { data: deletedFetchResults, message: 'Fetch results deleted' });
    } catch (err) {
        next(err);
    }
};
