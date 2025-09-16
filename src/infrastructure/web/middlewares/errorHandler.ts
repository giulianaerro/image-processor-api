import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '@application/errors/ApplicationErrors';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
  });

  if (error instanceof ApplicationError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        type: error.constructor.name,
      },
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: error.message,
      },
    });
    return;
  }

  if (error.name === 'CastError') {
    res.status(400).json({
      error: {
        message: 'Invalid ID format',
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message: 'Internal server error',
    },
  });
}
