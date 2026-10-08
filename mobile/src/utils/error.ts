export interface ValidationErrorDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  code: string;
  details?: ValidationErrorDetail[];
  status?: number;

  constructor(
    code: string = 'UNKNOWN_ERROR',
    message: string = 'An unexpected error occurred',
    details?: ValidationErrorDetail[],
    status?: number
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export function parseError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }

  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    if (errorObj.message && typeof errorObj.message === 'string') {
      return new AppError('ERROR', errorObj.message);
    }
  }

  return new AppError('UNKNOWN_ERROR', 'An unexpected error occurred.');
}
