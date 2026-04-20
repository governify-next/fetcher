import { body, validationResult } from 'express-validator';
import { type Request, type Response, type NextFunction } from 'express';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import * as fetcherService from '../services/fetchers/fetcher.service.js';
import { ZodError } from 'zod';

// ─── Express-validator ─────────────────────────────

const collectValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ValidationError('Validation failed', errors.array()));
    next();
};

export const validateFetcherId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherId } = req.params;
        const fetcher = fetcherService.getFetcherById(fetcherId);
        if (!fetcher) {
            return next(new NotFoundError(`Fetcher ${fetcherId} not found`));
        }
        next();
    } catch (err) {
        next(err);
    }
};

export const validateFetcherConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherId } = req.params;
        const { fetcherConfig } = req.body;
        const fetcher = fetcherService.getFetcherById(fetcherId);
        try {
            fetcher.fetcherConfigSchema.parse(fetcherConfig);
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Invalid fetcherConfig', { issues: error.issues }));
            }
            throw error;
        }
        next();
    } catch (err) {
        next(err);
    }
};

const dateRequiredValidation = body('date')
    .exists({ checkNull: true })
    .withMessage('date is required')
    .isISO8601()
    .withMessage('date must be a valid ISO 8601 date');

const fetcherConfigOptionalValidation = body('fetcherConfig')
    .optional()
    .isObject()
    .withMessage('fetcherConfig must be an object');

const fetcherConfigRequiredValidation = body('fetcherConfig')
    .exists({ checkNull: true })
    .withMessage('fetcherConfig is required')
    .isObject()
    .withMessage('fetcherConfig must be an object');

export const validateFetcherValidation = [fetcherConfigOptionalValidation, collectValidationErrors];

export const validateFetcherFetchBody = [
    dateRequiredValidation,
    fetcherConfigRequiredValidation,
    collectValidationErrors,
];
