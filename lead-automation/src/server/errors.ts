export class HttpError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, opts?: { retryAfterSeconds?: number }) {
    super(message);
    this.status = status;
    this.retryAfterSeconds = opts?.retryAfterSeconds;
  }
}

