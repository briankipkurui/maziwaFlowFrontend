import type { AxiosError } from 'axios';

export type FieldErrors = Record<string, string>;

type ApiValidationError = {
    statusCode?: number;
    message?: string | string[];
    error?: string;
};

const normalizeFieldName = (field: string): string => {
    return field
        .replace(/^profile\./, 'profile.')
        .replace(/"/g, '')
        .trim();
};

const extractFieldFromMessage = (message: string): string | null => {
    /**
     * Handles:
     * "property joinedAt should not exist"
     */
    const forbiddenPropertyMatch = message.match(/^property\s+(.+?)\s+should not exist$/i);

    if (forbiddenPropertyMatch?.[1]) {
        return normalizeFieldName(forbiddenPropertyMatch[1]);
    }

    /**
     * Handles:
     * "password must be a string"
     * "email must be an email"
     * "profile.firstName should not be empty"
     */
    const firstWordMatch = message.match(/^([a-zA-Z0-9_.]+)\s+/);

    if (firstWordMatch?.[1]) {
        return normalizeFieldName(firstWordMatch[1]);
    }

    return null;
};

export const parseApiFieldErrors = (error: unknown): FieldErrors => {
    const axiosError = error as AxiosError<ApiValidationError>;
    const responseMessage = axiosError.response?.data?.message;

    const messages = Array.isArray(responseMessage)
        ? responseMessage
        : responseMessage
            ? [responseMessage]
            : [];

    const fieldErrors: FieldErrors = {};

    for (const message of messages) {
        const field = extractFieldFromMessage(message);

        if (!field) {
            fieldErrors.general = message;
            continue;
        }

        fieldErrors[field] = message;
    }

    return fieldErrors;
};

export const getGeneralApiError = (error: unknown): string => {
    const axiosError = error as AxiosError<ApiValidationError>;
    const responseMessage = axiosError.response?.data?.message;

    if (Array.isArray(responseMessage)) {
        return responseMessage[0] ?? 'Something went wrong.';
    }

    return responseMessage ?? axiosError.message ?? 'Something went wrong.';
};