import { Task } from '../entities/Task';
import { TaskId } from '../value-objects/TaskId';

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  update(task: Task): Promise<void>;
}
