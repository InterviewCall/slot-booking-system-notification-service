import { isAxiosError } from 'axios';

/**
 * For provider HTTP errors, keep only what is needed to debug (status + the provider's response body).
 * Logging the whole AxiosError would also print the request config, i.e. the AiSensy API key.
 */
export function describeError(error: unknown): unknown {
    if(isAxiosError(error)) {
        return {
            message: error.message,
            status: error.response?.status,
            responseBody: error.response?.data
        };
    }

    return error;
}

export function getErrorMessage(error: unknown): string {
    if(isAxiosError(error)) {
        const body = error.response?.data;
        const detail = typeof body == 'string' ? body : body == null ? '' : JSON.stringify(body);

        return detail ? `${error.message}: ${detail}`.slice(0, 500) : error.message;
    }

    if(error instanceof Error) {
        return error.message;
    }

    if(typeof error == 'object' && error != null && 'message' in error && typeof error.message == 'string') {
        return error.message;
    }

    return 'Unknown Reason';
}

export function isAwsNotFoundException(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'NotFoundException'
    );
}
