export interface TErrorSource {
  path: string;
  message: string;
}

export interface TErrorResponse {
  httpStatusCode?: number;
  success: boolean;
  message: string;
  errorSources: TErrorSource[];
  stack?: string;
  error?: unknown;
}
