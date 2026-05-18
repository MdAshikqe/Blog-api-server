import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import {
  UserRole,
} from "../../../../prisma/generated/prisma/enums";
import { Post2Controller } from "./post2.controller";

const route = express.Router();

route.get(
  "/my-posts",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT),
  Post2Controller.getMyPosts,
);

route.patch("/:postId",checkAuth(UserRole.ADMIN,UserRole.CLIENT),Post2Controller.updatePost)
route.delete("/:postId",checkAuth(UserRole.ADMIN,UserRole.CLIENT),Post2Controller.deletePost)
route.get("/stats",checkAuth(UserRole.ADMIN),Post2Controller.getStats)
route.get("/my-stats",checkAuth(UserRole.CLIENT),Post2Controller.myStats)

export const post2Routes = route;
