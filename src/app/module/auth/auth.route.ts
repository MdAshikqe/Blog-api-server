import express from "express";
import { AuthControllers } from "./auth.controller";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.post("/register", AuthControllers.registerClient);
router.post("/login", AuthControllers.login);

router.post(
  "/my-profile",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT, UserRole.SUPER_ADMIN),
  AuthControllers.getMyProfile,
);

router.post("/refresh-token", AuthControllers.getRefreshToken);

router.post(
  "/change-password",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT, UserRole.SUPER_ADMIN),
  AuthControllers.changePassword,
);

router.post("/verify-email", AuthControllers.verifyEmail);

export const authRoutes = router;
