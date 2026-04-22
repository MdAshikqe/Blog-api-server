import express from "express";
import { UserController } from "./user.controller";

const router = express.Router();

router.post("/create-client", UserController.createClient);
router.post("/create-admin", UserController.createAdmin);
router.get("/", UserController.getAllUser);
router.get("/:id", UserController.getById);
router.patch("/:id/status", UserController.updateStatus);

export const userRoutes = router;
