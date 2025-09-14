export type TaskStatusType = 'pending' | 'processing' | 'completed' | 'failed';

export class TaskStatus {
  public readonly value: TaskStatusType;

  constructor(value: TaskStatusType) {
    if (!this.isValidStatus(value)) {
      throw new Error(`Invalid task status: ${value}`);
    }

    this.value = value;
  }

  static pending(): TaskStatus {
    return new TaskStatus('pending');
  }

  static processing(): TaskStatus {
    return new TaskStatus('processing');
  }

  static completed(): TaskStatus {
    return new TaskStatus('completed');
  }

  static failed(): TaskStatus {
    return new TaskStatus('failed');
  }

  private isValidStatus(value: string): value is TaskStatusType {
    return ['pending', 'processing', 'completed', 'failed'].includes(value);
  }

  isPending(): boolean {
    return this.value === 'pending';
  }

  isProcessing(): boolean {
    return this.value === 'processing';
  }

  isCompleted(): boolean {
    return this.value === 'completed';
  }

  isFailed(): boolean {
    return this.value === 'failed';
  }

  isFinished(): boolean {
    return this.isCompleted() || this.isFailed();
  }

  equals(other: TaskStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
