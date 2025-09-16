import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { environment } from '../config/environment';
import { DatabaseConnection } from '../database/connection';
import { errorHandler } from './middlewares/errorHandler';
import { createTaskRoutes } from './routes/taskRoutes';
import { TaskController } from './controllers/TaskController';
import { CreateTaskUseCase, GetTaskUseCase } from '@application/index';
import { TaskMongoRepository } from '../database/mongodb/TaskMongoRepository';
import { SharpImageProcessor } from '../image-processing/SharpImageProcessor';

class Server {
  private app = express();
  private database = DatabaseConnection.getInstance();

  async initialize(): Promise<void> {
    await this.connectDatabase();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private async connectDatabase(): Promise<void> {
    await this.database.connect();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    if (environment.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`, req.body);
        next();
      });
    }
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: this.database.isConnectionActive(),
      });
    });

    const taskRepository = new TaskMongoRepository();
    const imageProcessor = new SharpImageProcessor();
    const createTaskUseCase = new CreateTaskUseCase(
      taskRepository,
      imageProcessor
    );
    const getTaskUseCase = new GetTaskUseCase(taskRepository);
    const taskController = new TaskController(
      createTaskUseCase,
      getTaskUseCase
    );

    this.app.use('/api/tasks', createTaskRoutes(taskController));

    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: {
          message: `Route ${req.method} ${req.originalUrl} not found`,
        },
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    await this.initialize();

    this.app.listen(environment.PORT, () => {
      console.log(`Server running on port ${environment.PORT}`);
      console.log(`Environment: ${environment.NODE_ENV}`);
      console.log(`MongoDB: ${environment.MONGODB_URI}`);
    });
  }

  async stop(): Promise<void> {
    await this.database.disconnect();
  }
}

if (require.main === module) {
  const server = new Server();

  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await server.stop();
    process.exit(0);
  });
}

export { Server };
