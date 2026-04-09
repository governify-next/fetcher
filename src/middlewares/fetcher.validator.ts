import { body, validationResult } from 'express-validator';
import { type Request, type Response, type NextFunction } from 'express';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import * as fetcherService from '../services/fetchers/fetcher.service.js';

// ─── Express-validator ─────────────────────────────

const collectValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ValidationError('Validation failed', errors.array()));
    next();
};

export const validateFetcherName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fetcherName } = req.params;
        const fetcher = fetcherService.getFetcherByName(fetcherName);
        if (!fetcher) {
            return next(new NotFoundError(`Fetcher ${fetcherName} not found`));
        }
        next();
    } catch (err) {
        next(err);
    }
};

const fetchDateRequiredValidation = body('fetchDate')
    .exists({ checkNull: true })
    .withMessage('fetchDate is required')
    .isISO8601()
    .withMessage('fetchDate must be a valid ISO 8601 date');

const fetcherConfigOptionalValidation = body('fetcherConfig')
    .optional()
    .isObject()
    .withMessage('fetcherConfig must be an object');

const fetcherConfigRequiredValidation = body('fetcherConfig')
    .exists({ checkNull: true })
    .withMessage('fetcherConfig is required')
    .isObject()
    .withMessage('fetcherConfig must be an object');

const auditConfigOptionalValidation = body('auditConfig')
    .optional()
    .isObject()
    .withMessage('auditConfig must be an object');

const auditConfigRequiredValidation = body('auditConfig')
    .exists({ checkNull: true })
    .withMessage('auditConfig is required')
    .isObject()
    .withMessage('auditConfig must be an object');

export const validateFetcherValidation = [
    fetchDateRequiredValidation,
    fetcherConfigOptionalValidation,
    auditConfigOptionalValidation,
    collectValidationErrors,
];

export const validateFetcherFetchValidation = [
    fetcherConfigRequiredValidation,
    auditConfigRequiredValidation,
    collectValidationErrors,
];
