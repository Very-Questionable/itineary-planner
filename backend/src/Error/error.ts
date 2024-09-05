
export class InputError extends Error {
  constructor (message: string | undefined) {
    super(message);
    this.name = 'InputError';
  }
}

export class AccessError extends Error {
  constructor (message: string | undefined) {
    super(message);
    this.name = 'AccessError';
  }
}