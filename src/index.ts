const MESSAGE: string = 'Hello World' as const;

export class NotImplementedError extends Error {
  constructor(m: string) {
    super(m);
  }

  public override toString(): string {
    return `Not Implemented: ${this.message}\n${
      this.stack?.toString() ?? 'Missing stack information'
    }`;
  }
}

export function main() {
  console.log(MESSAGE);
  throw new NotImplementedError('main');
}
