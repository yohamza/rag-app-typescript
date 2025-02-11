import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../types/responses.types';

// Extend Express Response interface to include our custom methods
declare global {
    namespace Express {
        interface Response {
            ok<T>(data: T, message?: string): void;
        }
    }
}

// This middleware adds custom response methods to the Express Response object.
export const responseHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    res.ok = function<T>(data: T, message?: string): void {
        res.json(ResponseBuilder.success(data, message));
    };

    next();
};