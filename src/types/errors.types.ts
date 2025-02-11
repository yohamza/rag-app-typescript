export class BaseError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string, data?: any) {
    super(message, 'BAD_REQUEST', 400, data);
  }
}

export class DuplicateEntryError extends BaseError {
  constructor(message: string) {
    super(message, 'DUPLICATE_ENTRY', 409);
  }
}
  
export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}
  
export class DatabaseError extends BaseError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
  }
}
