import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenHelpers } from "../../helpers/tokenHelpers";
import ms, { StringValue } from "ms";
import config from "../../../config";
import { IAuthUser } from "../../interface/common";

const registerClient = catchAsync(async (req: Request, res: Response) => {
  const maxAge = ms(config.jwt.access_token_secret_expires_in as StringValue);
  console.log({ maxAge });

  const payload = req.body;
  const result = await AuthService.registerClient(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenHelpers.setAccessTokenCookie(res, accessToken);
  tokenHelpers.setRefreshTokenCookie(res, refreshToken);
  tokenHelpers.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Successfully cleint register",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AuthService.login(data);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenHelpers.setAccessTokenCookie(res, accessToken);
  tokenHelpers.setRefreshTokenCookie(res, refreshToken);
  tokenHelpers.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Login successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await AuthService.getMyProfile();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Successfully get my profile",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyEmail();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
    data: result,
  });
});

const getRefreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await AuthService.getRefreshToken(refreshToken);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "New token generated successfully",
    data: result,
  });
});
export const AuthControllers = {
  registerClient,
  login,
  getMyProfile,
  getRefreshToken,
  verifyEmail,
};
