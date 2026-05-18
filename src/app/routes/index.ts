import express from "express";
import { userRoutes } from "../module/user/user.route";
import { adminRoutes } from "../module/admin/admin.route";
import { authRoutes } from "../module/auth/auth.route";
import { postRoutes } from "../module/post/post.route";
import { post2Routes } from "../module/post2/post2.route";
import { commentRoutes } from "../module/comment/comment.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/post",
    route: postRoutes,
  },
  {
    path: "/post2",
    route: post2Routes,
  },
  {
    path: "/comment",
    route: commentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
