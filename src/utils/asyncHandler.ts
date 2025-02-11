import { Request, Response, NextFunction } from 'express';

/**
 * This function is used to wrap async route handlers in Express.
 * It ensures that any errors thrown in the handler are passed to the next middleware.
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};