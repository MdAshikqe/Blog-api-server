import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtHelpers } from "./jwtHelpers";
import config from "../../config";
import { Response } from "express";
import { CookieHelpers } from "./cookieHelpers";

const createAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtHelpers.createToken(
    payload,
    config.jwt.access_token_secret,
    { expiresIn: config.jwt.access_token_secret_expires_in } as SignOptions,
  );
  return accessToken;
};

const createRefressToken = (payload: JwtPayload) => {
  const refressToken = jwtHelpers.createToken(
    payload,
    config.jwt.refress_token_secret,
    { expiresIn: config.jwt.refress_token_secret_expires_in } as SignOptions,
  );
  return refressToken;
};

const setAccessTokenCookie = (res: Response, token: string) => {
  CookieHelpers.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1000,
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  CookieHelpers.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7 day
    maxAge: 60 * 60 * 24 * 1000 * 7,
  });
};

export const tokenHelpers = {
  createAccessToken,
  createRefressToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
};
