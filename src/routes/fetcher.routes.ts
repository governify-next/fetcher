import { Router } from 'express';
import {
    validateFetcherId,
    validateFetcherConfig,
    validateFetcherValidation,
    validateFetcherFetchBody,
} from '../middlewares/fetcher.validator.js';
import * as fetcherController from '../controllers/fetcher.controller.js';

export const fetcherRoutes = Router();

fetcherRoutes.get('/fetchers', fetcherController.getFetchers);
fetcherRoutes.get('/fetchers/:fetcherId', validateFetcherId, fetcherController.getFetcherById);
fetcherRoutes.post(
    '/fetchers/:fetcherId/fetch',
    validateFetcherFetchBody,
    validateFetcherId,
    validateFetcherConfig,
    fetcherController.fetchFetcher,
);
fetcherRoutes.post(
    '/fetchers/:fetcherId/validate',
    validateFetcherValidation,
    fetcherController.validateFetcher,
);
