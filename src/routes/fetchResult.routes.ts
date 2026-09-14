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
} from '../middlewares/fetchResult.validator.js';
import { anyOf } from '../middlewares/anyof.validator.js';
import { SystemRole } from '../types/systemRole.js';
import {
    hasSystemRole,
    checkUserAuthentication,
    checkServiceAuthentication,
    isService,
} from '../middlewares/authenticator.validator.js';

export const fetchResultRoutes = Router();

fetchResultRoutes.post(
    '/fetchers/:fetcherId/fetchResults/generate',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.SUPERADMIN), isService),
    validateFetcherFetchBody,
    validateFetcherId,
    validateFetcherConfig,
    fetchResultController.generateFetchResult,
);
fetchResultRoutes.get(
    '/fetchers/:fetcherId/fetchResults',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.SUPERADMIN), isService),
    validateFetcherId,
    fetchResultController.getFetchResultsByFetcherId,
);
fetchResultRoutes.delete(
    '/fetchers/:fetcherId/fetchResults',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.SUPERADMIN), isService),
    validateFetcherId,
    fetchResultController.deleteFetchResultsByFetcherId,
);
fetchResultRoutes.get(
    '/fetchers/:fetcherId/fetchResults/:fetchResultId',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.SUPERADMIN), isService),
    validateFetcherId,
    validateFetchResultId,
    validateExistingFetchResult,
    fetchResultController.getFetchResultByFetcherIdAndFetchResultId,
);
fetchResultRoutes.put(
    '/fetchers/:fetcherId/fetchResults/:fetchResultId',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.SUPERADMIN), isService),
    validateFetcherId,
    validateFetchResultId,
    validateExistingFetchResult,
    fetchResultController.updateFetchResultByFetcherIdAndFetchResultId,
);
fetchResultRoutes.delete(
    '/fetchers/:fetcherId/fetchResults/:fetchResultId',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.SUPERADMIN), isService),
    validateFetcherId,
    validateFetchResultId,
    validateExistingFetchResult,
    fetchResultController.deleteFetchResultByFetcherIdAndFetchResultId,
);
