import express from "express"
import { CommentControllers } from "./comment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../../prisma/generated/prisma/client";

const route=express.Router();

route.post("/",checkAuth(UserRole.ADMIN,UserRole.CLIENT),CommentControllers.createComment)

route.get("/:postId",checkAuth(UserRole.ADMIN,UserRole.CLIENT),CommentControllers.getAllComments)
route.get("/author/:authorId",CommentControllers.getCommentByUser)
route.get("/:commentId",CommentControllers.getCommentById)

route.delete("/:commentId",checkAuth(UserRole.ADMIN,UserRole.CLIENT),CommentControllers.deleteComment)

route.patch("/:commentId",checkAuth(UserRole.ADMIN,UserRole.CLIENT),CommentControllers.updateComment)
route.patch("/:commentId/moderate",checkAuth(UserRole.ADMIN),CommentControllers.moderatedComment)

export const commentRoutes=route;