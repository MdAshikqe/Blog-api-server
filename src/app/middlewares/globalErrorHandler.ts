import { NextFunction, Request, Response } from "express";
import config from "../../config";
import status from "http-status";
import { TErrorResponse, TErrorSource } from "../interface/error.interface";
import z from "zod";
import { handleZodError } from "../errors/handleZodError";
import AppError from "../errors/AppError";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (config.env === "development") {
    console.log("Error from global error handler", err);
  }
  /////todo after
  // if(req.file){
  //     await delete
  // }

  let errorSources: TErrorSource[] = [];
  let httpStatusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let stack: string | undefined = undefined;

  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    httpStatusCode = simplifiedError.httpStatusCode as number;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError) {
    httpStatusCode = err.httpStatusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    httpStatusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSources,
    error: config.env === "development" ? err : undefined,
    stack: config.env === "development" ? stack : undefined,
  };

  res.status(httpStatusCode).json(errorResponse);
};
