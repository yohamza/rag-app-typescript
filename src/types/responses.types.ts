export interface ApiResponse<T> {
    success: true;
    data: T;
    message?: string;
}

export class ResponseBuilder {
    static success<T>(data: T, message?: string): ApiResponse<T> {
        return {
            success: true,
            data,
            ...(message && { message })
        };
    }
}