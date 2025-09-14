export class TaskId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TaskId cannot be empty');
    }

    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      throw new Error('TaskId must be a valid ObjectId');
    }

    this.value = value;
  }

  static generate(): TaskId {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const randomBytes = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return new TaskId(timestamp + randomBytes);
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}
