import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenHelpers } from "../../helpers/tokenHelpers";

const login = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AuthService.login(data);
  const { accessToken, refreshToken, ...rest } = result;

  tokenHelpers.setAccessTokenCookie(res, accessToken);
  tokenHelpers.setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Login successfully",
    data: {
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getRefreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getRefreshToken();

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "New token generated successfully",
    data: result,
  });
});
export const AuthControllers = {
  login,
  getRefreshToken,
};
