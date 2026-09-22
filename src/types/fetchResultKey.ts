import { IFetchResultData } from '../models/fetchResult.model.js';

export type IFetchResultKey =
    | Pick<IFetchResultData, 'configHash'>
    | Pick<IFetchResultData, 'configHash' | 'effectiveAt'>;
