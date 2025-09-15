import { TaskId } from '../value-objects/TaskId';
import { TaskStatus } from '../value-objects/TaskStatus';
import { Price } from '../value-objects/Price';
import { Image } from './Image';

export class Task {
  public readonly id: TaskId;
  public readonly price: Price;
  public readonly originalPath: string;
  public readonly createdAt: Date;
  private status: TaskStatus;
  private updatedAt: Date;
  private error?: string;
  private images: Image[] = [];

  constructor(
    id: TaskId,
    status: TaskStatus,
    price: Price,
    originalPath: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    error?: string
  ) {
    if (!originalPath || originalPath.trim().length === 0) {
      throw new Error('Original path cannot be empty');
    }

    this.id = id;
    this.price = price;
    this.originalPath = originalPath;
    this.createdAt = createdAt;
    this.status = status;
    this.updatedAt = updatedAt;
    this.error = error;
  }

  static create(originalPath: string): Task {
    return new Task(
      TaskId.generate(),
      TaskStatus.pending(),
      Price.random(),
      originalPath
    );
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getError(): string | undefined {
    return this.error;
  }

  getImages(): Image[] {
    return [...this.images];
  }

  startProcessing(): void {
    if (!this.status.isPending()) {
      throw new Error('Can only start processing from pending status');
    }

    this.status = TaskStatus.processing();
    this.updatedAt = new Date();
  }

  complete(images: Image[]): void {
    if (!this.status.isProcessing()) {
      throw new Error('Can only complete from processing status');
    }

    if (!images || images.length === 0) {
      throw new Error('Completed task must have at least one image');
    }

    this.status = TaskStatus.completed();
    this.images = [...images];
    this.updatedAt = new Date();
    this.error = undefined;
  }

  fail(error: string): void {
    if (this.status.isCompleted()) {
      throw new Error('Cannot fail a completed task');
    }

    if (!error || error.trim().length === 0) {
      throw new Error('Error message cannot be empty');
    }

    this.status = TaskStatus.failed();
    this.error = error;
    this.updatedAt = new Date();
  }

  addImage(image: Image): void {
    if (!this.status.isProcessing()) {
      throw new Error('Can only add images during processing');
    }

    this.images.push(image);
    this.updatedAt = new Date();
  }

  toJSON(): {
    taskId: string;
    status: string;
    price: number;
    createdAt: string;
    updatedAt: string;
    originalPath: string;
    error?: string;
    images: Array<{
      resolution: string;
      path: string;
      md5: string;
      createdAt: string;
    }>;
  } {
    return {
      taskId: this.id.toString(),
      status: this.status.toString(),
      price: this.price.value,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      originalPath: this.originalPath,
      error: this.error,
      images: this.images.map((image) => image.toJSON()),
    };
  }
}
