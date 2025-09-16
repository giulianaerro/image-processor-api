import { Schema, Document } from 'mongoose';
import { TaskStatusType, ResolutionType } from '@domain/index';

export interface TaskDocument extends Document {
  _id: string;
  status: TaskStatusType;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  originalPath: string;
  error?: string;
  images: Array<{
    resolution: ResolutionType;
    path: string;
    md5: string;
    createdAt: Date;
  }>;
}

const ImageSchema = new Schema(
  {
    resolution: {
      type: String,
      required: true,
      enum: ['1024', '800'],
    },
    path: {
      type: String,
      required: true,
    },
    md5: {
      type: String,
      required: true,
      match: /^[a-fA-F0-9]{32}$/,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export const TaskSchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  price: {
    type: Number,
    required: true,
    min: 5,
    max: 50,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  originalPath: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    required: false,
  },
  images: [ImageSchema],
});

TaskSchema.index({ status: 1, createdAt: -1 });
TaskSchema.index({ createdAt: -1 });

TaskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
