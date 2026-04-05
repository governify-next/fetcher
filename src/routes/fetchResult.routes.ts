import { Router } from 'express';
import {
    validateFetcherName,
    validateFetcherFetchValidation,
} from '../middlewares/fetcher.validator.js';
import { validateFetchResultId } from '../middlewares/fetchResult.validator.js';

import * as fetchResultController from '../controllers/fetchResult.controller.js';

export const fetchResultRoutes = Router();

fetchResultRoutes.post(
    '/fetchResults/fetchers/:fetcherName/generate',
    validateFetcherName,
    validateFetcherFetchValidation,
    fetchResultController.generateFetchResult,
);

fetchResultRoutes.get('/fetchResults', fetchResultController.getFetchResults);
fetchResultRoutes.get(
    '/fetchResults/:id',
    validateFetchResultId,
    fetchResultController.getFetchResultById,
);
fetchResultRoutes.put(
    '/fetchResults/:id',
    validateFetchResultId,
    fetchResultController.updateFetchResultById,
);
fetchResultRoutes.delete(
    '/fetchResults/:id',
    validateFetchResultId,
    fetchResultController.deleteFetchResultById,
);
fetchResultRoutes.delete('/fetchResults', fetchResultController.deleteAllFetchResults);

fetchResultRoutes.get(
    '/fetchResults/fetchers/:fetcherName',
    validateFetcherName,
    fetchResultController.getFetchResultsByFetcherName,
);
fetchResultRoutes.delete(
    '/fetchResults/fetchers/:fetcherName',
    validateFetcherName,
    fetchResultController.deleteFetchResultsByFetcherName,
);
