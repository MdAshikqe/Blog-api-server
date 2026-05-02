import bcrypt from "bcryptjs";
import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { ILogin } from "./auth.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { tokenHelpers } from "../../helpers/tokenHelpers";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../../config";
import { JwtPayload } from "jsonwebtoken";

const login = async (payload: ILogin) => {
  const { email, password } = payload;

  const data = await prisma.user.findUniqueOrThrow({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    password,
    data.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.FORBIDDEN, "Password is incorrect");
  }

  if (data.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (data.isDeleted || data.status === UserStatus.DELETED) {
    throw new AppError(httpStatus.NOT_FOUND, "User is deleted");
  }

  const accessToken = tokenHelpers.createAccessToken({
    userId: data.id,
    name: data.name,
    role: data.role,
    status: data.status,
    emailVerified: data.emailVerified,
  });

  const refreshToken = tokenHelpers.createRefressToken({
    userId: data.id,
    name: data.name,
    role: data.role,
    status: data.status,
    emailVerified: data.emailVerified,
  });

  return {
    accessToken,
    refreshToken,
    needPasswordChange: data.needPasswordChange,
    role: data.role,
    status: data.status,
  };
};

const getRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "refresh token is missing");
  }
  const verifyRefreshToken = jwtHelpers.verifyToken(
    refreshToken,
    config.jwt.refress_token_secret,
  );
  if (!verifyRefreshToken.success && verifyRefreshToken.error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifyRefreshToken.data as JwtPayload;

  const newAccessToken = tokenHelpers.createAccessToken({
    userId: data.userId,
    name: data.name,
    role: data.role,
    status: data.status,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenHelpers.createRefressToken({
    userId: data.userId,
    name: data.name,
    role: data.role,
    status: data.status,
    emailVerified: data.emailVerified,
  });
};

export const AuthService = {
  login,
  getRefreshToken,
};
