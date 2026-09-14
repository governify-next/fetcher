import { Router } from 'express';
import {
    validateFetcherId,
    validateFetcherConfig,
    validateFetcherValidation,
    validateFetcherFetchBody,
} from '../middlewares/fetcher.validator.js';
import * as fetcherController from '../controllers/fetcher.controller.js';
import { anyOf } from '../middlewares/anyof.validator.js';
import { SystemRole } from '../types/systemRole.js';
import {
    hasSystemRole,
    checkUserAuthentication,
    checkServiceAuthentication,
    isService,
} from '../middlewares/authenticator.validator.js';

export const fetcherRoutes = Router();

fetcherRoutes.get(
    '/fetchers',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    fetcherController.getFetchers,
);
fetcherRoutes.get(
    '/fetchers/:fetcherId',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    validateFetcherId,
    fetcherController.getFetcherById,
);
fetcherRoutes.post(
    '/fetchers/:fetcherId/fetch',
    checkUserAuthentication,
    hasSystemRole(SystemRole.SUPERADMIN),
    validateFetcherFetchBody,
    validateFetcherId,
    validateFetcherConfig,
    fetcherController.fetchFetcher,
);
fetcherRoutes.post(
    '/fetchers/:fetcherId/validate',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.SUPERADMIN), isService),
    validateFetcherValidation,
    fetcherController.validateFetcher,
);
