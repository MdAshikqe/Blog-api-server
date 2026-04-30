import express from "express";
import { AuthControllers } from "./auth.controller";

const router = express.Router();

router.post("/login", AuthControllers.login);
router.post("/refresh-token", AuthControllers.getRefreshToken);

export const authRoutes = router;
