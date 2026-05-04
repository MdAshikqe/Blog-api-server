import bcrypt from "bcryptjs";
import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { IAuthUser, ILogin, IRegisterClientPayload } from "./auth.interface";
import AppError from "../../errors/AppError";
import httpStatus, { status } from "http-status";
import { tokenHelpers } from "../../helpers/tokenHelpers";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../../config";
import { JwtPayload } from "jsonwebtoken";
import { auth } from "../../../lib/auth";
import { APIError } from "better-auth";

const registerClient = async (payload: IRegisterClientPayload) => {
  const { email, name, password } = payload;

  // const hashPassword = await bcrypt.hash(password, 10);

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Failed to register client user",
    );
  }

  try {
    const client = await prisma.$transaction(async (tx) => {
      const clientTx = await tx.client.create({
        data: {
          name: payload.name,
          email: data.user.email,
        },
      });
      return clientTx;
    });
    const accessToken = tokenHelpers.createAccessToken({
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenHelpers.createRefressToken({
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
      client,
    };
  } catch (error) {
    console.log("Transaction error :", error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

const login = async (payload: ILogin) => {
  const { email, password } = payload;

  await prisma.user.findUniqueOrThrow({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
  });

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  // const isCorrectPassword: boolean = await bcrypt.compare(
  //   password,
  //   data.password,
  // );

  // if (!isCorrectPassword) {
  //   throw new AppError(httpStatus.FORBIDDEN, "Password is incorrect");
  // }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(httpStatus.NOT_FOUND, "User is deleted");
  }

  const accessToken = tokenHelpers.createAccessToken({
    userId: data.user.id,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenHelpers.createRefressToken({
    userId: data.user.id,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getMyProfile = async (user: IAuthUser) => {
  const isUserExits = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      client: true,
    },
  });
  if (!isUserExits) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExits;
};

const verifyEmail = async () => {
  console.log("verify email");
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
  registerClient,
  login,
  getMyProfile,
  verifyEmail,
  getRefreshToken,
};
