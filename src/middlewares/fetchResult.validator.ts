import { type Request, type Response, type NextFunction } from 'express';
import { NotFoundError, DuplicateKeyError } from '../utils/customErrors.js';
import * as fetchResultService from '../services/fetchResult.service.js';

// ─── Custom validators ─────────────────────────────
export const validateFetchResultId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, fetcherName } = req.params;
        const fetchResult = await fetchResultService.getFetchResultByFetcherNameAndId(
            fetcherName,
            id,
        );
        if (!fetchResult) {
            return next(new NotFoundError(`Fetch result ${id} not found for ${fetcherName}`));
        }
        next();
    } catch (err) {
        next(err);
    }
};

export const validateExistingFetchResultBeforeGeneration = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { fetcherName } = req.params;
        const { fetchDate, auditConfig, fetcherConfig } = req.body;
        const existingFetchResult = await fetchResultService.getFetchResultsByFetchResultBody(
            fetcherName,
            new Date(fetchDate),
            auditConfig,
            fetcherConfig,
        );
        if (existingFetchResult.length > 0) {
            return next(
                new DuplicateKeyError(
                    `A fetch result already exists for fetcher '${fetcherName}' with the id '${existingFetchResult[0]._id}' and current status '${existingFetchResult[0].status}' for the provided fetch date, audit configuration, and fetcher configuration`,
                ),
            );
        }
        next();
    } catch (err) {
        next(err);
    }
};
