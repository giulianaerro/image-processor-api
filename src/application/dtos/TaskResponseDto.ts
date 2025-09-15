import { TaskStatusType, ResolutionType } from '@domain/index';

export interface TaskResponseDto {
  taskId: string;
  status: TaskStatusType;
  price: number;
  createdAt?: string;
  updatedAt?: string;
  images?: ImageResponseDto[];
  error?: string;
}

export interface ImageResponseDto {
  resolution: ResolutionType;
  path: string;
}
