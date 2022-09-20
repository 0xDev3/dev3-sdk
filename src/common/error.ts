export class BackendError extends Error {
  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
  }
}

export class SDKError extends Error {
  constructor(message: string) {
    super(message);
  }
}
