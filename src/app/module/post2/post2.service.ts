import status from "http-status";
import AppError from "../../errors/AppError";
import { IAuthUser } from "../auth/auth.interface";
import { prisma } from "../../../lib/prisma";
import { CommentStatus, PostStatus, UserRole, UserStatus } from "../../../../prisma/generated/prisma/enums";
import { Post } from "../../../../prisma/generated/prisma/client";
import { tr } from "zod/locales";
// import { IAuthUser } from "../../interface/common";

const getMyPosts = async (user: IAuthUser) => {
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "User Unauthorized");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const result = await prisma.post.findMany({
    where: {
      clientId: userData.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  const total= await prisma.post.count({
      where: {
        clientId: userData.id,
      },
    })
    return {
      total,
      posts:result
    }
};

const updatePost=async(postId:string,user:IAuthUser,isAdmin:boolean,data:Partial<Post>)=>{
  if(!user){
    throw new AppError(status.UNAUTHORIZED,"You are not authorized")
  }
  const postData= await prisma.post.findUniqueOrThrow({
    where:{
      id:postId
    },
    select:{
      id:true,
      clientId:true,
    }
  })
   
  const userData=await prisma.user.findUniqueOrThrow({
    where:{
      id:postData.clientId
    },
    select:{
      id:true,
      email:true,
      name:true,
      role:true
    }
  })
  
  if(!isAdmin && (userData.role !== user.role)){
      throw new AppError(status.UNAUTHORIZED,"You are not the owner/creator of the post!")
  }

if(!isAdmin){
  delete data.isFeatured
}

const result=await prisma.post.update({
  where:{
    id:postData.id
  },
  data
})
    return result
}

const deletePost=async(postId:string,user:IAuthUser,isAdmin:boolean)=>{
   if(!user){
    throw new AppError(status.UNAUTHORIZED,"You are not authorized")
  }
  const postData= await prisma.post.findUniqueOrThrow({
    where:{
      id:postId
    },
    select:{
      id:true,
      isFeatured:true,
      clientId:true,
    }
  })

  const userData= await prisma.user.findUniqueOrThrow({
    where:{
      id:postData.clientId
    },
    select:{
      id:true,
      email:true,
      role:true,
      status:true
    }
  })

  if(!isAdmin && (userData.role !==user.role)){
    throw new AppError(status.UNAUTHORIZED,"You are not the owner/creator of the post!")
  }

  return await prisma.post.delete({
    where:{
      id:postId
    }
  })

}


//use Admin api
const getStats=async()=>{
  return await prisma.$transaction(async(tx)=>{
    const [totalPosts,archivedPosts,draftPosts,publlishedPosts, totalComments,
       approvedComment,rejectComment, totalUsers, adminCount, clientCount, totalViews]=
    await Promise.all([
      await tx.post.count(),
      await tx.post.count({where:{status:PostStatus.ARCHIVED}}),
      await tx.post.count({where:{status:PostStatus.DRAFT}}),
      await tx.post.count({where:{status:PostStatus.PUBLISHED}}),
      await tx.comment.count(),
      await tx.comment.count({where:{status:CommentStatus.APPROVED}}),
      await tx.comment.count({where:{status:CommentStatus.REJECT}}),
      await tx.user.count(),
      await tx.user.count({where:{role:UserRole.ADMIN}}),
      await tx.user.count({where:{role:UserRole.CLIENT}}),
      await tx.post.aggregate({
        _sum:{
          views:true
        }
      })
    ])
    return {
          totalPosts,
            publlishedPosts,
            draftPosts,
            archivedPosts,
            totalComments,
            approvedComment,
            rejectComment,
            totalUsers,
            adminCount,
            clientCount,
            totalViews:totalViews._sum.views
    }
  })
}

const myStats=async(user:IAuthUser)=>{

  if(!user){
    throw new AppError(status.UNAUTHORIZED,"You are not authorized user")
  }
   
  await prisma.user.findUniqueOrThrow({
    where:{
      email:user.email,
      role:UserRole.CLIENT
    }
  });

  return await prisma.$transaction(async(tx)=>{
    const [totalPosts,archivedPosts,draftPosts,publlishedPosts, totalComments,
       approvedComment,rejectComment, totalViews]=
    await Promise.all([
      await tx.post.count(),
      await tx.post.count({where:{status:PostStatus.ARCHIVED}}),
      await tx.post.count({where:{status:PostStatus.DRAFT}}),
      await tx.post.count({where:{status:PostStatus.PUBLISHED}}),
      await tx.comment.count(),
      await tx.comment.count({where:{status:CommentStatus.APPROVED}}),
      await tx.comment.count({where:{status:CommentStatus.REJECT}}),
      await tx.post.aggregate({
        _sum:{
          views:true
        }
      })
    ])
    return {
          totalPosts,
            publlishedPosts,
            draftPosts,
            archivedPosts,
            totalComments,
            approvedComment,
            rejectComment,
            totalViews:totalViews._sum.views
    }
  })

}

export const Post2Service = {
  getMyPosts,
  updatePost,
  deletePost,
  getStats,
  myStats
};
