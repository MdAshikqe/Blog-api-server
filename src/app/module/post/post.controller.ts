import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { PostServices } from "./post.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IAuthUser } from "../auth/auth.interface";
import { pick } from "../../shared/pick";
import { postFilterAbleFields, postPaginationFields } from "./post.constant";

const createPost = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await PostServices.createPost(req.body, user as IAuthUser);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Post create successfully",
    data: result,
  });
});

const getAllPost = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, postFilterAbleFields);
  const option = pick(req.query, postPaginationFields);

  const result = await PostServices.getAllPost(filter, option);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Post retrive successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const result = await PostServices.getPostById(postId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Post retrive id successfully",
    data: result,
  });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  console.log("user", user);
  const result = await PostServices.getMyPosts(user as IAuthUser);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My post successfully retrive",
    data: result,
  });
});

const myPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.myPosts();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "post",
    data: result,
  });
});

export const PostController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  myPosts,
};
