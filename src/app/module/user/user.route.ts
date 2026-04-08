import express from "express";
import { UserController } from "./user.controller";

const router = express.Router();

router.post("/create-client", UserController.createClient);

export const userRoutes = router;
