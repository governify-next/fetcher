import mongoose, { Schema, Document, Types } from 'mongoose';
import { FetchType } from '../types/fetchType.js';
import { FetchStatus } from '../types/fetchStatus.js';

export interface IFetchResult extends Document {
    fetcherName: string;
    fetchStartDate: Date;
    fetchEndDate: Date | null;
    fetchDate: Date | null;
    fetchType: FetchType;
    status: FetchStatus;
    auditConfig: Record<string, unknown>;
    fetcherConfig: Record<string, unknown>;
    data: unknown | null;
}

const FetchResultSchema: Schema<IFetchResult> = new Schema(
    {
        fetcherName: { type: String, required: true },
        fetchStartDate: { type: Date, required: true },
        fetchEndDate: { type: Date, default: null },
        fetchDate: { type: Date, default: null },
        fetchType: { type: String, enum: Object.values(FetchType), required: true },
        status: { type: String, enum: Object.values(FetchStatus), required: true },
        auditConfig: { type: Schema.Types.Mixed, required: true },
        fetcherConfig: { type: Schema.Types.Mixed, required: true },
        data: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: true },
);

export const FetchResultModel = mongoose.model<IFetchResult>('FetchResult', FetchResultSchema);

export default FetchResultModel;
