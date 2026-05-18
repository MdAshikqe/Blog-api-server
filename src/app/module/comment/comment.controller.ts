import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { CommentServices } from "./comment.service";
import { sendResponse } from "../../shared/sendResponse";
import { status } from "http-status";
import { IAuthUser } from "../../interface/common";

const createComment=catchAsync(async(req:Request,res:Response)=>{
        const user=req.user
        const result= await CommentServices.createComment(req.body,user as IAuthUser);

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Comment create successfully",
            data:result
        })
})
const getCommentByUser=catchAsync(async(req:Request,res:Response)=>{
        const {authorId}=req.params;
        const result= await CommentServices.getCommentByUser(authorId as string);

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Comment retrive by author successfully",
            data:result
        })
})

const getCommentById=catchAsync(async(req:Request,res:Response)=>{
        const {commentId}=req.params;
        const result= await CommentServices.getCommentById(commentId as string);

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Comment retrive by id successfully",
            data:result
        })
})

const deleteComment=catchAsync(async(req:Request,res:Response)=>{
        const {commentId}=req.params;
        const user=req.user;
        const result= await CommentServices.deleteComment(commentId as string,user as IAuthUser);

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"successfully delete comment by user",
            data:result
        })
})
const updateComment=catchAsync(async(req:Request,res:Response)=>{
        const {commentId}=req.params;
        const user=req.user;
        const result= await CommentServices.updateComment(commentId as string,user as IAuthUser,req.body);

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Comment update successfully",
            data:result
        })
})

export const CommentControllers={
    createComment,
    getCommentByUser,
    getCommentById,
    deleteComment,
    updateComment
}