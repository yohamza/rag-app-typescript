import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../types/errors.types';
import logger from '../utils/logger';

// Define our error response structure for better type safety
interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        data?: any;
    };
}

// This middleware handles all errors and returns a standardized error response.
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
): void => {

    logger.logError("Oops! Something went wrong.", { 
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method 
    });

    if (error instanceof BaseError) {
        res.status(error.status).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                ...(error.data && { data: error.data })
            }
        });
        return;
    }

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred'
        }
    });
    return;
};