import { createHash } from 'node:crypto';

const sortValue = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(sortValue);
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, nestedValue]) => [key, sortValue(nestedValue)]),
        );
    }

    return value;
};

export const hashFetcherConfig = (fetcherConfig: Record<string, unknown>): string => {
    const canonicalConfig = JSON.stringify(sortValue(fetcherConfig));
    return createHash('sha256').update(canonicalConfig).digest('hex');
};
