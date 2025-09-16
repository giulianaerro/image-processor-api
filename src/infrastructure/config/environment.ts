import dotenv from 'dotenv';

dotenv.config();

interface Environment {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  UPLOAD_DIR: string;
  OUTPUT_DIR: string;
}

function validateEnvironment(): Environment {
  const env = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI:
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/image-processor-api',
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    OUTPUT_DIR: process.env.OUTPUT_DIR || './output',
  };

  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  return env;
}

export const environment = validateEnvironment();
