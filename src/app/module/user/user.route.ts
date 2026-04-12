import express from "express";
import { UserController } from "./user.controller";

const router = express.Router();

router.post("/create-client", UserController.createClient);
router.post("/create-admin", UserController.createAdmin);
router.get("/", UserController.getAllUser);

export const userRoutes = router;
