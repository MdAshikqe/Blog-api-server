import express from "express";
import { AuthControllers } from "./auth.controller";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.post("/register", AuthControllers.registerClient);
router.post("/login", AuthControllers.login);

router.get(
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

router.post(
  "/logout",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT, UserRole.SUPER_ADMIN),
  AuthControllers.logoutUser,
);

router.post("/verify-email", AuthControllers.verifyEmail);
router.post("/forgat-password", AuthControllers.forgetPassword);
router.post("/reset-password", AuthControllers.resetPassword);

router.get("/login/google", AuthControllers.googleLogin);
router.get("/google/success", AuthControllers.googleLoginSuccess);
router.get("/oauth/error", AuthControllers.handleOAuthError);

export const authRoutes = router;
