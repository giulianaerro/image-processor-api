export type ResolutionType = '1024' | '800';

export class Resolution {
  public readonly value: ResolutionType;

  constructor(value: ResolutionType) {
    if (value !== '1024' && value !== '800') {
      throw new Error(`Invalid resolution: ${value}. Must be 1024 or 800`);
    }
    this.value = value;
  }

  static readonly RESOLUTIONS = ['1024', '800'] as const;

  toString(): string {
    return this.value;
  }

  toNumber(): number {
    return parseInt(this.value, 10);
  }

  equals(other: Resolution): boolean {
    return this.value === other.value;
  }
}
