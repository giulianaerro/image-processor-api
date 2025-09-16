import { model } from 'mongoose';
import { TaskSchema, TaskDocument } from '../schemas/TaskSchema';

export const TaskModel = model<TaskDocument>('Task', TaskSchema);
