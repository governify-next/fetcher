import { Router } from 'express';
import * as fetchResultController from '../controllers/fetchResult.controller.js';
import {
    validateFetcherName,
    validateFetcherFetchValidation,
} from '../middlewares/fetcher.validator.js';
import {
    validateFetchResultId,
    validateExistingFetchResultBeforeGeneration,
} from '../middlewares/fetchResult.validator.js';

export const fetchResultRoutes = Router();

fetchResultRoutes.post(
    '/fetchResults/fetchers/:fetcherName/generate',
    validateFetcherName,
    validateFetcherFetchValidation,
    validateExistingFetchResultBeforeGeneration,
    fetchResultController.generateFetchResult,
);
fetchResultRoutes.delete(
    '/fetchResults/fetchers/:fetcherName',
    validateFetcherName,
    fetchResultController.deleteFetchResultsByFetcherName,
);
fetchResultRoutes.get(
    '/fetchResults/fetchers/:fetcherName',
    validateFetcherName,
    fetchResultController.getFetchResultsByFetcherName,
);
fetchResultRoutes.get(
    '/fetchResults/fetchers/:fetcherName/:id',
    validateFetcherName,
    validateFetchResultId,
    fetchResultController.getFetchResultByFetcherNameAndId,
);
fetchResultRoutes.put(
    '/fetchResults/fetchers/:fetcherName/:id',
    validateFetcherName,
    validateFetchResultId,
    fetchResultController.updateFetchResultByFetcherNameAndId,
);
fetchResultRoutes.delete(
    '/fetchResults/fetchers/:fetcherName/:id',
    validateFetcherName,
    validateFetchResultId,
    fetchResultController.deleteFetchResultByFetcherNameAndId,
);
