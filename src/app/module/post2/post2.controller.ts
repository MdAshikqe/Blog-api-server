import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { Post2Service } from "./post2.service";
import { IAuthUser } from "../auth/auth.interface";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status"
import { UserRole } from "../../../../prisma/generated/prisma/enums";
// import { IAuthUser } from "../../interface/common";

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await Post2Service.getMyPosts(user as IAuthUser);
  const {posts,total}=result;

  sendResponse(res, {
    httpStatusCode:status.OK,
    success: true,
    message: "My post successfully retrieved",
    data: {
      total,
      posts
    },
  });
});

const updatePost=catchAsync(async(req:Request,res:Response)=>{
  const{postId}=req.params;
  const user=req.user;
  const isAdmin=user?.role === UserRole.ADMIN;
  const result= await Post2Service.updatePost(postId as string,user as IAuthUser,isAdmin,req.body);

  sendResponse(res,{
    httpStatusCode:status.OK,
    success:true,
    message:"Update post successfully",
    data:result
  })
})

export const Post2Controller = {
  getMyPosts,
  updatePost
};
