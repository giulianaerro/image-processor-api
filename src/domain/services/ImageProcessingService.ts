import { Image } from '../entities/Image';

export interface ImageProcessingService {
  processImage(originalPath: string, originalFileName: string): Promise<Image[]>;
}
