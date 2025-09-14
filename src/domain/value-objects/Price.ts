export class Price {
  public readonly value: number;

  constructor(value: number) {
    if (value < 5 || value > 50) {
      throw new Error('Price must be between 5 and 50');
    }
    this.value = Math.round(value * 100) / 100;
  }

  static random(): Price {
    return new Price(Math.random() * 45 + 5);
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toFixed(2);
  }

  toJSON(): number {
    return this.value;
  }
}