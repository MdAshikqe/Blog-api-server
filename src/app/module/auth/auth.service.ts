import bcrypt from "bcryptjs";
import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { ILogin } from "./auth.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { tokenHelpers } from "../../helpers/tokenHelpers";

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

  const refressToken = tokenHelpers.createRefressToken({
    userId: data.id,
    name: data.name,
    role: data.role,
    status: data.status,
    emailVerified: data.emailVerified,
  });

  return {
    accessToken,
    refressToken,
    needPasswordChange: data.needPasswordChange,
    role: data.role,
    status: data.status,
  };
};

export const AuthService = {
  login,
};
