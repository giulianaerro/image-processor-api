import { TaskRepository } from '@domain/repositories/TaskRepository';
import {
  Task,
  TaskId,
  TaskStatus,
  Price,
  Image,
  Resolution,
} from '@domain/index';
import { TaskModel } from './TaskModel';
import { TaskDocument } from '../schemas/TaskSchema';

export class TaskMongoRepository implements TaskRepository {
  async save(task: Task): Promise<void> {
    const taskData = {
      _id: task.id.toString(),
      status: task.getStatus().value,
      price: task.price.value,
      createdAt: task.createdAt,
      updatedAt: task.getUpdatedAt(),
      originalPath: task.originalPath,
      error: task.getError(),
      images: task.getImages().map((image) => ({
        resolution: image.resolution.value,
        path: image.path,
        md5: image.md5,
        createdAt: image.createdAt,
      })),
    };

    const taskModel = new TaskModel(taskData);
    await taskModel.save();
  }

  async findById(id: TaskId): Promise<Task | null> {
    const taskDoc = await TaskModel.findById(id.toString()).exec();

    if (!taskDoc) {
      return null;
    }

    return this.mapDocumentToTask(taskDoc);
  }

  async update(task: Task): Promise<void> {
    const updateData = {
      status: task.getStatus().value,
      updatedAt: task.getUpdatedAt(),
      error: task.getError(),
      images: task.getImages().map((image) => ({
        resolution: image.resolution.value,
        path: image.path,
        md5: image.md5,
        createdAt: image.createdAt,
      })),
    };

    await TaskModel.findByIdAndUpdate(task.id.toString(), updateData, {
      new: true,
    }).exec();
  }

  private mapDocumentToTask(doc: TaskDocument): Task {
    const images = doc.images.map(
      (imageDoc) =>
        new Image(
          new Resolution(imageDoc.resolution),
          imageDoc.path,
          imageDoc.md5,
          imageDoc.createdAt
        )
    );

    return Task.fromDatabase(
      new TaskId(doc._id),
      new TaskStatus(doc.status),
      new Price(doc.price),
      doc.originalPath,
      doc.createdAt,
      doc.updatedAt,
      images,
      doc.error
    );
  }
}
