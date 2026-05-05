import bcrypt from "bcryptjs";
import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import {
  IAuthUser,
  IChangePasswordPayload,
  ILogin,
  IRegisterClientPayload,
} from "./auth.interface";
import AppError from "../../errors/AppError";
import httpStatus, { status } from "http-status";
import { tokenHelpers } from "../../helpers/tokenHelpers";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../../config";
import { JwtPayload } from "jsonwebtoken";
import { auth } from "../../../lib/auth";
import { APIError, date } from "better-auth";

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

const getRefreshToken = async (refreshToken: string, sessionToken: string) => {
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "refresh token is missing");
  }
  const isSessionTokenExists = await prisma.session.findUniqueOrThrow({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token.");
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
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenHelpers.createRefressToken({
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    emailVerified: data.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const { currentPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const accessToken = tokenHelpers.createAccessToken({
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    status: session.user.status,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = tokenHelpers.createRefressToken({
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    status: session.user.status,
    emailVerified: session.user.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
};

const forgetPassword = async (email: string) => {
  const isUserExits = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  if (!isUserExits) {
    throw new AppError(status.NOT_FOUND, "User not found!!");
  }

  if (!isUserExits.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "User not verified.");
  }

  if (isUserExits.isDeleted || isUserExits.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found!!");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

export const AuthService = {
  registerClient,
  login,
  getMyProfile,
  getRefreshToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
};
