import { validationResult } from 'express-validator';
import { type Request, type Response, type NextFunction } from 'express';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import * as fetchResultService from '../services/fetchResult.service.js';

// ─── Custom validators ─────────────────────────────

export const validateFetchResultId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const fetchResult = await fetchResultService.getFetchResultById(id);
        if (!fetchResult) {
            return next(new NotFoundError(`Fetch result ${id} not found`));
        }
        next();
    } catch (err) {
        next(err);
    }
};
