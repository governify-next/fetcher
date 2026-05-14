import { type Request, type Response, type NextFunction } from 'express';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/standardResponse.js';
import * as fetchResultService from '../services/fetchResult.service.js';

// ─── Custom validators ─────────────────────────────
export const validateFetchResultId = async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.fetchResultId)) {
        return next(new ValidationError('Invalid mongo id', { id: req.params.fetchResultId }));
    }
    next();
};

export const validateExistingFetchResult = async (
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
        if (!fetchResult) {
            return next(
                new NotFoundError(`Fetch result ${fetchResultId} not found for ${fetcherId}`),
            );
        }
        next();
    } catch (err) {
        next(err);
    }
};
