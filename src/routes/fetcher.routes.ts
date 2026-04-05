import { Router } from 'express';
import {
    validateFetcherName,
    validateFetcherValidation,
    validateFetcherFetchValidation,
} from '../middlewares/fetcher.validator.js';
import * as fetcherController from '../controllers/fetcher.controller.js';

export const fetcherRoutes = Router();

fetcherRoutes.get('/fetchers', fetcherController.getFetchers);
fetcherRoutes.get(
    '/fetchers/:fetcherName',
    validateFetcherName,
    fetcherController.getFetcherByName,
);
fetcherRoutes.post(
    '/fetchers/:fetcherName/fetch',
    validateFetcherName,
    validateFetcherFetchValidation,
    fetcherController.fetchFetcher,
);
fetcherRoutes.post(
    '/fetchers/:fetcherName/validate',
    validateFetcherName,
    validateFetcherValidation,
    fetcherController.validateFetcher,
);
