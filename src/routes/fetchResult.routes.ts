import { Router } from 'express';
import * as fetchResultController from '../controllers/fetchResult.controller.js';
import {
    validateFetcherId,
    validateFetcherConfig,
    validateFetcherFetchBody,
} from '../middlewares/fetcher.validator.js';
import {
    validateExistingFetchResult,
    validateFetchResultId,
    validateExistingFetchResultBeforeGeneration,
} from '../middlewares/fetchResult.validator.js';

export const fetchResultRoutes = Router();

fetchResultRoutes.post(
    '/fetchers/:fetcherId/fetchResults/generate',
    validateFetcherFetchBody,
    validateFetcherId,
    validateFetcherConfig,
    validateExistingFetchResultBeforeGeneration,
    fetchResultController.generateFetchResult,
);
fetchResultRoutes.get(
    '/fetchers/:fetcherId/fetchResults',
    validateFetcherId,
    fetchResultController.getFetchResultsByFetcherId,
);
fetchResultRoutes.delete(
    '/fetchers/:fetcherId/fetchResults',
    validateFetcherId,
    fetchResultController.deleteFetchResultsByFetcherId,
);
fetchResultRoutes.get(
    '/fetchers/:fetcherId/fetchResults/:fetchResultId',
    validateFetcherId,
    validateFetchResultId,
    validateExistingFetchResult,
    fetchResultController.getFetchResultByFetcherIdAndFetchResultId,
);
fetchResultRoutes.put(
    '/fetchers/:fetcherId/fetchResults/:fetchResultId',
    validateFetcherId,
    validateFetchResultId,
    validateExistingFetchResult,
    fetchResultController.updateFetchResultByFetcherIdAndFetchResultId,
);
fetchResultRoutes.delete(
    '/fetchers/:fetcherId/fetchResults/:fetchResultId',
    validateFetcherId,
    validateFetchResultId,
    validateExistingFetchResult,
    fetchResultController.deleteFetchResultByFetcherIdAndFetchResultId,
);
