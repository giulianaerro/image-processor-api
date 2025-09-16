import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateCreateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const schema = Joi.object({
    originalPath: Joi.string().required().min(1).messages({
      'string.empty': 'originalPath cannot be empty',
      'any.required': 'originalPath is required',
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: error.details.map((detail) => detail.message),
      },
    });
    return;
  }

  next();
}

export function validateTaskId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const schema = Joi.object({
    taskId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'taskId must be a valid ObjectId',
        'any.required': 'taskId is required',
      }),
  });

  const { error } = schema.validate(req.params);

  if (error) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: error.details.map((detail) => detail.message),
      },
    });
    return;
  }

  next();
}
