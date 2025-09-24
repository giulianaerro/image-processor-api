import { CreateTaskUseCase } from '@application/use-cases/CreateTaskUseCase';
import { TaskRepository } from '@domain/repositories/TaskRepository';
import { ImageProcessingService } from '@domain/services/ImageProcessingService';
import { Task, TaskId, Image, Resolution } from '@domain/index';
import { InvalidInputError } from '@application/errors/ApplicationErrors';
import * as fs from 'fs/promises';

jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('CreateTaskUseCase', () => {
  let createTaskUseCase: CreateTaskUseCase;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockImageProcessingService: jest.Mocked<ImageProcessingService>;

  beforeEach(() => {
    mockTaskRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    mockImageProcessingService = {
      processImage: jest.fn(),
    };

    mockFs.access.mockReset();

    createTaskUseCase = new CreateTaskUseCase(
      mockTaskRepository,
      mockImageProcessingService
    );
  });

  describe('execute', () => {
    const validDto = { originalPath: '/path/to/image.jpg' };

    it('should create task successfully for valid input', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const result = await createTaskUseCase.execute(validDto);

      expect(result.taskId).toBeDefined();
      expect(result.status).toMatch(/^(pending|processing)$/);
      expect(result.price).toBeGreaterThanOrEqual(5);
      expect(result.price).toBeLessThanOrEqual(50);
      expect(mockTaskRepository.save).toHaveBeenCalledWith(expect.any(Task));
    });

    it('should throw error for empty originalPath', async () => {
      await expect(
        createTaskUseCase.execute({ originalPath: '' })
      ).rejects.toThrow(new InvalidInputError('originalPath is required'));

      await expect(
        createTaskUseCase.execute({ originalPath: '   ' })
      ).rejects.toThrow(new InvalidInputError('originalPath is required'));
    });

    it('should validate file exists for local paths', async () => {
      mockFs.access.mockRejectedValue(new Error('ENOENT'));

      await expect(createTaskUseCase.execute(validDto)).rejects.toThrow(
        new InvalidInputError('File not found: /path/to/image.jpg')
      );
    });

    it('should skip file validation for HTTP URLs', async () => {
      const httpDto = { originalPath: 'http://example.com/image.jpg' };

      const result = await createTaskUseCase.execute(httpDto);

      expect(result.taskId).toBeDefined();
      expect(mockFs.access).not.toHaveBeenCalled();
    });

    it('should validate file extension', async () => {
      mockFs.access.mockResolvedValue(undefined);

      await expect(
        createTaskUseCase.execute({ originalPath: '/path/to/document.pdf' })
      ).rejects.toThrow(new InvalidInputError('Unsupported file format: .pdf'));
    });

    it('should accept valid image extensions', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const validExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.bmp',
        '.webp',
      ];

      for (const ext of validExtensions) {
        const dto = { originalPath: `/path/to/image${ext}` };
        const result = await createTaskUseCase.execute(dto);
        expect(result.taskId).toBeDefined();
      }
    });

    it('should start background processing', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const mockImages = [
        new Image(new Resolution('1024'), '/output/1024.jpg', 'a'.repeat(32)),
        new Image(new Resolution('800'), '/output/800.jpg', 'b'.repeat(32)),
      ];
      mockImageProcessingService.processImage.mockResolvedValue(mockImages);

      await createTaskUseCase.execute(validDto);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockTaskRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('background processing', () => {
    it('should handle image processing success', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const mockImages = [
        new Image(new Resolution('1024'), '/output/1024.jpg', 'a'.repeat(32)),
      ];
      mockImageProcessingService.processImage.mockResolvedValue(mockImages);

      await createTaskUseCase.execute({ originalPath: '/path/to/image.jpg' });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockTaskRepository.update).toHaveBeenCalled();
    });

    it('should handle image processing failure', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockImageProcessingService.processImage.mockRejectedValue(
        new Error('Processing failed')
      );

      await createTaskUseCase.execute({ originalPath: '/path/to/image.jpg' });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockTaskRepository.update).toHaveBeenCalled();
    });
  });
});
