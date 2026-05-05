import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenHelpers } from "../../helpers/tokenHelpers";
import ms, { StringValue } from "ms";
import config from "../../../config";
import { IAuthUser } from "./auth.interface";
import AppError from "../../errors/AppError";
import { CookieHelpers } from "../../helpers/cookieHelpers";

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
  const result = await AuthService.getMyProfile(user as IAuthUser);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Successfully get my profile",
    data: result,
  });
});

const getRefreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.getRefreshToken(
    refreshToken,
    betterAuthSessionToken,
  );

  const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

  tokenHelpers.setAccessTokenCookie(res, accessToken);
  tokenHelpers.setRefreshTokenCookie(res, newRefreshToken);
  tokenHelpers.setBetterAuthSessionCookie(res, sessionToken);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "New token generated successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken,
    },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];

  const result = await AuthService.changePassword(
    payload,
    betterAuthSessionToken,
  );

  const { accessToken, refreshToken, token } = result;

  tokenHelpers.setAccessTokenCookie(res, accessToken);
  tokenHelpers.setRefreshTokenCookie(res, refreshToken);
  tokenHelpers.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Successfully change your password",
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];

  const result = await AuthService.logoutUser(betterAuthSessionToken);

  CookieHelpers.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  CookieHelpers.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  CookieHelpers.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged out successfully.",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await AuthService.verifyEmail(email, otp);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset OTP sent to email successfully",
  });
});

export const AuthControllers = {
  registerClient,
  login,
  getMyProfile,
  getRefreshToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
};
