import sharp from 'sharp';
import { ImageProcessingService } from '@domain/services/ImageProcessingService';
import { Image, Resolution } from '@domain/index';
import { environment } from '../config/environment';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

export class SharpImageProcessor implements ImageProcessingService {
  async processImage(
    originalPath: string,
    originalFileName: string
  ): Promise<Image[]> {
    try {
      await this.ensureDirectoryExists(environment.OUTPUT_DIR);

      const baseName = path.parse(originalFileName).name;
      const extension = path.parse(originalFileName).ext;

      const imageOutputDir = path.join(environment.OUTPUT_DIR, baseName);
      await this.ensureDirectoryExists(imageOutputDir);

      const resolutions = Resolution.RESOLUTIONS;

      const processedImages = await Promise.all(
        resolutions.map((resolutionValue) => {
          const resolution = new Resolution(resolutionValue);
          return this.processImageResolution(
            originalPath,
            imageOutputDir,
            resolution,
            extension
          );
        })
      );

      return processedImages;
    } catch (error) {
      throw new Error(
        `Failed to process image: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  private async processImageResolution(
    originalPath: string,
    imageOutputDir: string,
    resolution: Resolution,
    extension: string
  ): Promise<Image> {
    const resolutionDir = path.join(imageOutputDir, resolution.value);
    await this.ensureDirectoryExists(resolutionDir);

    const imageBuffer = await sharp(originalPath)
      .resize({ width: resolution.toNumber() })
      .toBuffer();

    const md5Hash = crypto.createHash('md5').update(imageBuffer).digest('hex');

    const outputFileName = `${md5Hash}${extension}`;
    const outputPath = path.join(resolutionDir, outputFileName);

    await fs.writeFile(outputPath, imageBuffer);

    return new Image(resolution, outputPath, md5Hash);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  static async validateImageFile(filePath: string): Promise<boolean> {
    try {
      const metadata = await sharp(filePath).metadata();
      return metadata.format !== undefined;
    } catch {
      return false;
    }
  }

  static async getImageMetadata(filePath: string): Promise<{
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  }> {
    try {
      const metadata = await sharp(filePath).metadata();
      const stats = await fs.stat(filePath);

      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
      };
    } catch (error) {
      throw new Error(
        `Failed to get image metadata: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
