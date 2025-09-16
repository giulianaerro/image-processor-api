import { Request, Response, NextFunction } from 'express';
import { CreateTaskUseCase, GetTaskUseCase } from '@application/index';
import { ApplicationError } from '@application/errors/ApplicationErrors';

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase
  ) {}

  async createTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { originalPath } = req.body;

      const result = await this.createTaskUseCase.execute({ originalPath });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { taskId } = req.params;

      const result = await this.getTaskUseCase.execute(taskId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
