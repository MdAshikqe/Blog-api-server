import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import {
  UserRole,
  UserStatus,
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

export const post2Routes = route;
