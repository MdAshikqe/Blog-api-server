import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../../prisma/generated/prisma/enums";
import { CookieHelpers } from "../helpers/cookieHelpers";
import AppError from "../errors/AppError";
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { email } from "better-auth";
import { jwtHelpers } from "../helpers/jwtHelpers";
import config from "../../config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        role: UserRole;
        email: string;
      };
    }
  }
}

export const checkAuth =
  (...authRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //session token verification
      const sessionToken = CookieHelpers.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No session token provided. ",
        );
      }
      if (sessionToken) {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;

          const now = new Date();
          const expiresAt = new Date(sessionExists.expiresAt);
          const createdAt = new Date(sessionExists.createdAt);

          const sessionLeftTime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentRemaining = (timeRemaining / sessionLeftTime) * 100;

          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());

            console.log("Session Expiring Soon!!");
          }

          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED
          ) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! User is not active.",
            );
          }

          if (user.isDeleted) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! User is deleted",
            );
          }

          if (authRoles.length > 0 && !authRoles.includes(user.role)) {
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden acces! You do not have permission to access this resource.",
            );
          }

          req.user = {
            role: user.role,
            email: user.email,
          };
        }

        const accessToken = CookieHelpers.getCookie(req, "accessToken");
        if (!accessToken) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! No access token provided.",
          );
        }
      }

      //Access Token Verification
      const accessToken = CookieHelpers.getCookie(req, "accessToken");
      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No access token provided.",
        );
      }

      const verifiedToken = jwtHelpers.verifyToken(
        accessToken,
        config.jwt.access_token_secret,
      );

      if (!verifiedToken.success) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid access token.",
        );
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.data!.role as UserRole)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource",
        );
      }
      next();
    } catch (error: any) {
      next(error);
    }
  };
