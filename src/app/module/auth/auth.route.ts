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
router.post("/verify-email", AuthControllers.verifyEmail);
router.post("/refresh-token", AuthControllers.getRefreshToken);

export const authRoutes = router;
