import { TaskId, TaskRepository } from '@domain/index';
import { TaskResponseDto, ImageResponseDto } from '../dtos/TaskResponseDto';
import {
  TaskNotFoundError,
  InvalidInputError,
} from '../errors/ApplicationErrors';

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(taskId: string): Promise<TaskResponseDto> {
    this.validateInput(taskId);

    const taskIdVO = new TaskId(taskId);

    const task = await this.taskRepository.findById(taskIdVO);
    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    const response: TaskResponseDto = {
      taskId: task.id.toString(),
      status: task.getStatus().value,
      price: task.price.value,
    };

    if (task.getStatus().isFinished()) {
      response.createdAt = task.createdAt.toISOString();
      response.updatedAt = task.getUpdatedAt().toISOString();
    }

    if (task.getStatus().isCompleted()) {
      response.images = task.getImages().map((image) => ({
        resolution: image.resolution.value,
        path: image.path,
      }));
    }

    if (task.getStatus().isFailed()) {
      response.error = task.getError();
    }

    return response;
  }

  private validateInput(taskId: string): void {
    if (!taskId || taskId.trim().length === 0) {
      throw new InvalidInputError('taskId is required');
    }

    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      throw new InvalidInputError('taskId must be a valid ObjectId');
    }
  }
}
