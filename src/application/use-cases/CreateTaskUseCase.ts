import { Task, TaskRepository, ImageProcessingService } from '@domain/index';
import { CreateTaskDto } from '../dtos/CreateTaskDto';
import { TaskResponseDto } from '../dtos/TaskResponseDto';
import {
  InvalidInputError,
  ImageProcessingError,
} from '../errors/ApplicationErrors';
import * as fs from 'fs/promises';
import * as path from 'path';

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly imageProcessingService: ImageProcessingService
  ) {}

  async execute(dto: CreateTaskDto): Promise<TaskResponseDto> {
    await this.validateInput(dto);

    const task = Task.create(dto.originalPath);

    await this.taskRepository.save(task);

    this.processImageInBackground(task);

    return {
      taskId: task.id.toString(),
      status: task.getStatus().value,
      price: task.price.value,
    };
  }

  private async validateInput(dto: CreateTaskDto): Promise<void> {
    if (!dto.originalPath || dto.originalPath.trim().length === 0) {
      throw new InvalidInputError('originalPath is required');
    }

    if (!dto.originalPath.startsWith('http')) {
      try {
        await fs.access(dto.originalPath);
      } catch (error) {
        throw new InvalidInputError(`File not found: ${dto.originalPath}`);
      }
    }

    const ext = path.extname(dto.originalPath).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    if (!validExtensions.includes(ext)) {
      throw new InvalidInputError(`Unsupported file format: ${ext}`);
    }
  }

  private async processImageInBackground(task: Task): Promise<void> {
    try {
      task.startProcessing();
      await this.taskRepository.update(task);

      const fileName = path.basename(task.originalPath);

      const processedImages = await this.imageProcessingService.processImage(
        task.originalPath,
        fileName
      );

      task.complete(processedImages);
      await this.taskRepository.update(task);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown processing error';

      try {
        task.fail(errorMessage);
        await this.taskRepository.update(task);
      } catch (updateError) {
        console.error('Failed to update task with error:', updateError);
      }
    }
  }
}
