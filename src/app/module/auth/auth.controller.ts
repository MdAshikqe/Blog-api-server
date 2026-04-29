import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Login successfully",
    data: result,
  });
});

export const AuthControllers = {
  login,
};
