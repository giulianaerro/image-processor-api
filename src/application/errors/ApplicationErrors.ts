export abstract class ApplicationError extends Error {
  abstract readonly statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TaskNotFoundError extends ApplicationError {
  readonly statusCode = 404;
  
  constructor(taskId: string) {
    super(`Task with id ${taskId} not found`);
  }
}

export class InvalidInputError extends ApplicationError {
  readonly statusCode = 400;
  
  constructor(message: string) {
    super(`Invalid input: ${message}`);
  }
}

export class ImageProcessingError extends ApplicationError {
  readonly statusCode = 500;
  
  constructor(message: string) {
    super(`Image processing failed: ${message}`);
  }
}

export class TaskStateError extends ApplicationError {
  readonly statusCode = 409;
  
  constructor(message: string) {
    super(`Invalid task state: ${message}`);
  }
}
