import { Resolution } from '../value-objects/Resolution';

export class Image {
  public readonly resolution: Resolution;
  public readonly path: string;
  public readonly md5: string;
  public readonly createdAt: Date;

  constructor(
    resolution: Resolution,
    path: string,
    md5: string,
    createdAt: Date = new Date()
  ) {
    if (!path || path.trim().length === 0) {
      throw new Error('Image path cannot be empty');
    }

    if (!md5 || md5.trim().length === 0) {
      throw new Error('Image MD5 cannot be empty');
    }

    if (!/^[a-fA-F0-9]{32}$/.test(md5)) {
      throw new Error('Invalid MD5 format');
    }

    this.resolution = resolution;
    this.path = path;
    this.md5 = md5;
    this.createdAt = createdAt;
  }

  equals(other: Image): boolean {
    return (
      this.path === other.path &&
      this.md5 === other.md5 &&
      this.resolution.equals(other.resolution)
    );
  }

  toJSON(): {
    resolution: string;
    path: string;
    md5: string;
    createdAt: string;
  } {
    return {
      resolution: this.resolution.value,
      path: this.path,
      md5: this.md5,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
