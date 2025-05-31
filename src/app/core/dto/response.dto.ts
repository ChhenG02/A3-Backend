import { formatDateToMMDDYYYY, formatTimeToHHMM } from "../utils/date.utils";
import { PaginationMeta } from "./pagination.dto";

export interface MetaData {
    timestamp: string;
    requestId?: string;
    executionTime?: number; // in milliseconds
    totalCount?: number;   // for paginated responses
}

export class ApiResponseDto<T> {
    statusCode: number;
    success: boolean;
    data: T | null;
    message: string;
    meta: PaginationMeta | MetaData;;
    errors?: Record<string, string[]>; // for detailed error information

    constructor(
        statusCode: number,
        success: boolean,
        data: T | null,
        message: string,
        meta: MetaData,
        errors?: Record<string, string[]>
    ) {
        this.statusCode = statusCode;
        this.success = success;
        this.data = data;
        this.message = message;

        const now = new Date();
        const formattedTimestamp = `${formatDateToMMDDYYYY(now)} ${formatTimeToHHMM(now)}`;

        this.meta = {
            ...meta,
            timestamp: formattedTimestamp,
        };
        this.errors = errors;
    }

    static success<T>(
        data: T,
        message: string = 'Success',
        statusCode: number = 200,
        meta: Partial<PaginationMeta> | Partial<MetaData> = {}
    ): ApiResponseDto<T> {
        const now = new Date();
        const formattedTimestamp = `${formatDateToMMDDYYYY(now)} ${formatTimeToHHMM(now)}`;
        return new ApiResponseDto(
            statusCode,
            true,
            data,
            message,
            {
                timestamp: formattedTimestamp,
                ...meta
            }
        );
    }

    static error<T>(
        message: string,
        statusCode: number = 400,
        errors?: Record<string, string[]>,
        meta: Partial<MetaData> = {}
    ): ApiResponseDto<T> {
        const now = new Date();
        const formattedTimestamp = `${formatDateToMMDDYYYY(now)} ${formatTimeToHHMM(now)}`;
        return new ApiResponseDto(
            statusCode,
            false,
            null,
            message,
            {
                timestamp: formattedTimestamp,
                ...meta
            },
            errors
        );
    }
}