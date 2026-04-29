import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtHelpers } from "./jwtHelpers";
import config from "../../config";

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

export const tokenHelpers = {
  createAccessToken,
  createRefressToken,
};
