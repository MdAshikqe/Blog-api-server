import express from "express";
import { PostController } from "./post.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import {
  UserRole,
  UserStatus,
} from "../../../../prisma/generated/prisma/enums";

const route = express.Router();

route.post(
  "/",
  checkAuth(UserRole.CLIENT, UserRole.ADMIN),
  PostController.createPost,
);

route.get("/", PostController.getAllPost);
route.get("/:postId", PostController.getPostById);

route.get(
  "/my-posts",
  checkAuth(UserRole.ADMIN, UserRole.CLIENT),
  PostController.getMyPosts,
);

route.get("/all-posts", PostController.myPosts);

export const postRoutes = route;
