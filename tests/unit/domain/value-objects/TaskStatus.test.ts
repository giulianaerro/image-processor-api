import { TaskStatus } from '@domain/value-objects/TaskStatus';

describe('TaskStatus Value Object', () => {
  describe('constructor', () => {
    it('should create valid task statuses', () => {
      expect(() => new TaskStatus('pending')).not.toThrow();
      expect(() => new TaskStatus('processing')).not.toThrow();
      expect(() => new TaskStatus('completed')).not.toThrow();
      expect(() => new TaskStatus('failed')).not.toThrow();
    });

    it('should throw error for invalid status', () => {
      expect(() => new TaskStatus('invalid' as any)).toThrow('Invalid task status: invalid');
    });
  });

  describe('factory methods', () => {
    it('should create pending status', () => {
      const status = TaskStatus.pending();
      expect(status.value).toBe('pending');
      expect(status.isPending()).toBe(true);
    });

    it('should create processing status', () => {
      const status = TaskStatus.processing();
      expect(status.value).toBe('processing');
      expect(status.isProcessing()).toBe(true);
    });

    it('should create completed status', () => {
      const status = TaskStatus.completed();
      expect(status.value).toBe('completed');
      expect(status.isCompleted()).toBe(true);
    });

    it('should create failed status', () => {
      const status = TaskStatus.failed();
      expect(status.value).toBe('failed');
      expect(status.isFailed()).toBe(true);
    });
  });

  describe('status checking methods', () => {
    it('should correctly identify pending status', () => {
      const status = TaskStatus.pending();
      expect(status.isPending()).toBe(true);
      expect(status.isProcessing()).toBe(false);
      expect(status.isCompleted()).toBe(false);
      expect(status.isFailed()).toBe(false);
      expect(status.isFinished()).toBe(false);
    });

    it('should correctly identify processing status', () => {
      const status = TaskStatus.processing();
      expect(status.isPending()).toBe(false);
      expect(status.isProcessing()).toBe(true);
      expect(status.isCompleted()).toBe(false);
      expect(status.isFailed()).toBe(false);
      expect(status.isFinished()).toBe(false);
    });

    it('should correctly identify completed as finished', () => {
      const status = TaskStatus.completed();
      expect(status.isCompleted()).toBe(true);
      expect(status.isFinished()).toBe(true);
    });

    it('should correctly identify failed as finished', () => {
      const status = TaskStatus.failed();
      expect(status.isFailed()).toBe(true);
      expect(status.isFinished()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for same status values', () => {
      const status1 = TaskStatus.pending();
      const status2 = TaskStatus.pending();
      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different status values', () => {
      const status1 = TaskStatus.pending();
      const status2 = TaskStatus.completed();
      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      expect(TaskStatus.pending().toString()).toBe('pending');
      expect(TaskStatus.processing().toString()).toBe('processing');
      expect(TaskStatus.completed().toString()).toBe('completed');
      expect(TaskStatus.failed().toString()).toBe('failed');
    });
  });
});

