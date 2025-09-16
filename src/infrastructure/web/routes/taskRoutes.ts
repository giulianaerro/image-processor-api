import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { validateCreateTask, validateTaskId } from '../middlewares/validation';

export function createTaskRoutes(taskController: TaskController): Router {
  const router = Router();

  // POST /tasks - Create a new task
  router.post('/', validateCreateTask, (req, res, next) =>
    taskController.createTask(req, res, next)
  );

  // GET /tasks/:taskId - Get task by ID
  router.get('/:taskId', validateTaskId, (req, res, next) =>
    taskController.getTask(req, res, next)
  );

  return router;
}
