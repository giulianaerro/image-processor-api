import {
  Task,
  TaskId,
  TaskStatus,
  Price,
  Image,
  Resolution,
} from '@domain/index';

describe('Task Entity', () => {
  const validTaskId = new TaskId('507f1f77bcf86cd799439011');
  const validPrice = new Price(25.5);
  const validPath = '/path/to/image.jpg';

  describe('constructor', () => {
    it('should create task with valid parameters', () => {
      const task = new Task(
        validTaskId,
        TaskStatus.pending(),
        validPrice,
        validPath
      );

      expect(task.id).toBe(validTaskId);
      expect(task.price).toBe(validPrice);
      expect(task.originalPath).toBe(validPath);
      expect(task.getStatus().isPending()).toBe(true);
    });

    it('should throw error for empty original path', () => {
      expect(
        () => new Task(validTaskId, TaskStatus.pending(), validPrice, '')
      ).toThrow('Original path cannot be empty');

      expect(
        () => new Task(validTaskId, TaskStatus.pending(), validPrice, '   ')
      ).toThrow('Original path cannot be empty');
    });

    it('should set creation and update timestamps', () => {
      const before = new Date();
      const task = new Task(
        validTaskId,
        TaskStatus.pending(),
        validPrice,
        validPath
      );
      const after = new Date();

      expect(task.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(task.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(task.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(task.getUpdatedAt().getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });
  });

  describe('create factory method', () => {
    it('should create task with random ID and price', () => {
      const task = Task.create(validPath);

      expect(task.id).toBeDefined();
      expect(task.price.value).toBeGreaterThanOrEqual(5);
      expect(task.price.value).toBeLessThanOrEqual(50);
      expect(task.originalPath).toBe(validPath);
      expect(task.getStatus().isPending()).toBe(true);
    });

    it('should create different tasks on multiple calls', () => {
      const task1 = Task.create(validPath);
      const task2 = Task.create(validPath);

      expect(task1.id.toString()).not.toBe(task2.id.toString());
    });
  });

  describe('status transitions', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create(validPath);
    });

    it('should transition from pending to processing', () => {
      expect(task.getStatus().isPending()).toBe(true);

      task.startProcessing();

      expect(task.getStatus().isProcessing()).toBe(true);
      expect(task.getUpdatedAt()).toBeDefined();
    });

    it('should not allow starting processing from non-pending status', () => {
      task.startProcessing();

      expect(() => task.startProcessing()).toThrow(
        'Can only start processing from pending status'
      );
    });

    it('should complete task with images', () => {
      const images = [
        new Image(new Resolution('1024'), '/path/1024.jpg', 'a'.repeat(32)),
        new Image(new Resolution('800'), '/path/800.jpg', 'b'.repeat(32)),
      ];

      task.startProcessing();
      task.complete(images);

      expect(task.getStatus().isCompleted()).toBe(true);
      expect(task.getImages()).toHaveLength(2);
      expect(task.getError()).toBeUndefined();
    });

    it('should not allow completing from non-processing status', () => {
      const images = [
        new Image(new Resolution('1024'), '/path/1024.jpg', 'a'.repeat(32)),
      ];

      expect(() => task.complete(images)).toThrow(
        'Can only complete from processing status'
      );
    });

    it('should not allow completing without images', () => {
      task.startProcessing();

      expect(() => task.complete([])).toThrow(
        'Completed task must have at least one image'
      );
    });

    it('should fail task with error message', () => {
      const errorMessage = 'Image processing failed';

      task.startProcessing();
      task.fail(errorMessage);

      expect(task.getStatus().isFailed()).toBe(true);
      expect(task.getError()).toBe(errorMessage);
    });

    it('should not allow failing completed task', () => {
      const images = [
        new Image(new Resolution('1024'), '/path/1024.jpg', 'a'.repeat(32)),
      ];

      task.startProcessing();
      task.complete(images);

      expect(() => task.fail('Error')).toThrow('Cannot fail a completed task');
    });

    it('should not allow failing with empty error message', () => {
      task.startProcessing();

      expect(() => task.fail('')).toThrow('Error message cannot be empty');
      expect(() => task.fail('   ')).toThrow('Error message cannot be empty');
    });
  });

  describe('toJSON', () => {
    it('should serialize task correctly', () => {
      const task = new Task(
        validTaskId,
        TaskStatus.completed(),
        validPrice,
        validPath,
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T10:05:00Z')
      );

      const json = task.toJSON();

      expect(json).toEqual({
        taskId: validTaskId.toString(),
        status: 'completed',
        price: 25.5,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:05:00.000Z',
        originalPath: validPath,
        error: undefined,
        images: [],
      });
    });

    it('should include images when task is completed', () => {
      const task = Task.create(validPath);
      const images = [
        new Image(new Resolution('1024'), '/path/1024.jpg', 'a'.repeat(32)),
      ];

      task.startProcessing();
      task.complete(images);

      const json = task.toJSON();
      expect(json.images).toHaveLength(1);
      expect(json.images[0].resolution).toBe('1024');
    });
  });
});
