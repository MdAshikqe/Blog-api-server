import { status } from "http-status";
import { prisma } from "../../../lib/prisma";
import AppError from "../../errors/AppError";
import { IAuthUser } from "../../interface/common";
import { ICommentPayload, ICommentUpdatePayload } from "./comment.interface";
import { CommentStatus } from "../../../../prisma/generated/prisma/enums";
import { tr } from "zod/v4/locales/index.js";
import { name } from "ejs";

const createComment=async(payload:ICommentPayload,user:IAuthUser)=>{

             await prisma.user.findUniqueOrThrow({
        where:{
            email:user.email
        }
    })
   const postData= await prisma.post.findUniqueOrThrow({
        where:{
            id:payload.postId
        }
    })



    if(payload.parentId){
        await prisma.comment.findUniqueOrThrow({
            where:{
                id:payload.parentId
            }
        })
    }
    const payloadData={
        content:payload.content,
        clientId:postData.clientId,
        postId:postData.id,
        parentId:payload?.parentId
    }

    const result= await prisma.comment.create({
        data:payloadData
    })
    return result
}

const getAllComments=async(postId:string,user:IAuthUser)=>{
    const userData= await prisma.user.findFirstOrThrow({
        where:{
            email:user.email
        }
    })
    const result= await prisma.comment.findMany({
        where:{
            postId,
            status:CommentStatus.APPROVED
        },
    })
    return {
        name:userData.name,
        image:userData.image,
        result
    }
}

const getCommentByUser=async(authorId:string)=>{
    const result= await prisma.comment.findMany({
        where:{
            clientId:authorId
        },
        orderBy:{createdAt:"desc"},
        include:{
            post:{
                select:{
                    id:true,
                    title:true
                }
            }
        }
    })
    return result;
}

const getCommentById=async(commentId:string)=>{
    const result= await prisma.comment.findUniqueOrThrow({
        where:{
            id:commentId
        },
        include:{
            post:{
                select:{
                    id:true,
                    title:true,
                    views:true
                }
            }
        }
    })
    return result;
}

const deleteComment=async(commentId:string,user:IAuthUser)=>{
   const userData= await prisma.user.findUniqueOrThrow({
    where:{
        email:user.email
    }
   })

   const commentData= await prisma.comment.findFirstOrThrow({
    where:{
        id:commentId,
        clientId:userData.id
    },
    select:{
        id:true
    }
   })

   if(!commentData){
    throw new AppError(status.NOT_FOUND,"Your provided input is invalid!")
   }

   const result= await prisma.comment.delete({
    where:{
        id:commentData.id
    }
   })
   return result;
}

const updateComment=async(commentId:string,user:IAuthUser,payload:ICommentUpdatePayload)=>{

    const userData= await prisma.user.findUniqueOrThrow({
        where:{
            email:user.email
        }
    })

    const commentData= await prisma.comment.findFirstOrThrow({
        where:{
            id:commentId,
            clientId:userData.id
        },
        select:{
            id:true,
            content:true
        }
    })
      if(!commentData){
    throw new AppError(status.NOT_FOUND,"Your provided input is invalid!")
   }

   const result= await prisma.comment.update({
    where:{
        id:commentData.id,
        clientId:userData.id
    },
    data:payload
   })

   return result;

}

const moderatedComment=async(commentId:string,payload:{status:CommentStatus})=>{
    const commentData= await prisma.comment.findUniqueOrThrow({
                where:{
                    id:commentId
                },
                select:{
                    id:true,
                    status:true
                }
    })

    if(commentData.status === payload.status){
        throw new AppError(status.ALREADY_REPORTED,`Your provided status (${payload.status}) is already up to date.`)
    }

    const result= await prisma.comment.update({
        where:{
            id:commentId
        },
        data:payload
    })
    return result
}

export const CommentServices={
    createComment,
    getAllComments,
    getCommentByUser,
    getCommentById,
    deleteComment,
    updateComment,
    moderatedComment
}