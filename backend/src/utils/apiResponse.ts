export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: string | null;
    code?: string;
    meta?: any;
}

export const successResponse = <T>(data: T, meta?: any): ApiResponse<T> => ({
    success: true,
    data,
    error: null,
    meta,
});

export const errorResponse = (message: string, code: string): ApiResponse<null> => ({
    success: false,
    data: null,
    error: message,
    code,
});
