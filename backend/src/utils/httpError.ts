export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;

    // Fix prototype chain (penting untuk instanceof bekerja di transpiled JS)
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
