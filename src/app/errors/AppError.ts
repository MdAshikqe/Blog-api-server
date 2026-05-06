class AppError extends Error {
  public httpStatusCode: number;

  constructor(httpStatusCode: number, message: string | undefined, stack = "") {
    super(message);
    this.httpStatusCode = httpStatusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default AppError;
