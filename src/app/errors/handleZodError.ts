import z from "zod";
import { TErrorResponse, TErrorSource } from "../interface/error.interface";
import status from "http-status";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
  const httpStatusCode = status.BAD_REQUEST;
  const message = "Zod validation error";
  const errorSources: TErrorSource[] = [];

  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message,
    });
  });

  return {
    success: false,
    message,
    errorSources,
    httpStatusCode,
  };
};
