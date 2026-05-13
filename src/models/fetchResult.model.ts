import mongoose, { Schema, Document } from 'mongoose';
import { FetchStatus } from '../types/fetchStatus.js';

export interface IFetchResult extends Document {
    startDate: Date;
    endDate: Date | null;
    date: Date;
    status: FetchStatus;
    fetcherConfig: Record<string, unknown>;
    data: unknown | null;
}

const FetchResultSchema: Schema<IFetchResult> = new Schema(
    {
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        date: { type: Date, required: true },
        status: { type: String, enum: Object.values(FetchStatus), required: true },
        fetcherConfig: { type: Schema.Types.Mixed, required: true },
        data: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: true },
);

FetchResultSchema.index({ date: 1, fetcherConfig: 1 }, { unique: true });

const FETCH_RESULT_COLLECTION_PREFIX = 'fetchresults';
const FETCH_RESULT_MODEL_PREFIX = 'FetchResult';

const sanitizeFetcherId = (fetcherId: string): string => {
    return fetcherId
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '');
};

export const getFetcherResultsCollectionName = (fetcherId: string): string => {
    const sanitizedFetcherId = sanitizeFetcherId(fetcherId);
    return `${FETCH_RESULT_COLLECTION_PREFIX}_${sanitizedFetcherId}`;
};

export const getFetcherResultsModel = (fetcherId: string) => {
    const modelName = `${FETCH_RESULT_MODEL_PREFIX}_${sanitizeFetcherId(fetcherId)}`;
    const existingModel = mongoose.models[modelName] as mongoose.Model<IFetchResult> | undefined;
    if (existingModel) {
        return existingModel;
    }
    return mongoose.model<IFetchResult>(
        modelName,
        FetchResultSchema,
        getFetcherResultsCollectionName(fetcherId),
    );
};
