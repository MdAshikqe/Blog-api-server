import status from "http-status";
import AppError from "../../errors/AppError";
import { IAuthUser } from "../auth/auth.interface";
import { prisma } from "../../../lib/prisma";
import {
  CommentStatus,
  Post,
  PostStatus,
  Prisma,
  UserStatus,
} from "../../../../prisma/generated/prisma/client";
import { IPostFilters, IPostPagination } from "./post.interface";
import { postSearchAbleFields } from "./post.constant";
import { PaginationHelper } from "../../helpers/paginationHelper";

const createPost = async (
  payload: Omit<Post, "id" | "createdAt" | "updatedAt" | "clientId">,
  user: IAuthUser,
) => {
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }
  const isUserExit = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  if (!isUserExit) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const result = await prisma.post.create({
    data: {
      ...payload,
      clientId: isUserExit.id,
    },
  });

  return result;
};

const getAllPost = async (params: IPostFilters, option: IPostPagination) => {
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.PostWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: postSearchAbleFields.map((field) => {
        if (field === "tags") {
          return {
            tags: {
              has: searchTerm,
            },
          };
        }
        return {
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        };
      }),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  //pagination part
  const whereCondition: Prisma.PostWhereInput = { AND: andConditions };

  const total = await prisma.post.count({
    where: whereCondition,
  });

  const { page, limit, skip, sortBy, sortOrder, totalPages } =
    PaginationHelper.calculatepagination(option, total);

  const result = await prisma.post.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "desc" },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: result,
  };
};

const getPostById = async (postId: string) => {
  try {
    // if (!postId) {
    //   throw new AppError(status.INTERNAL_SERVER_ERROR, "Post id is required");
    // }
    return await prisma.$transaction(async (tx) => {
      await tx.post.updateMany({
        where: {
          id: postId,
          status: PostStatus.PUBLISHED,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
      const postData = await tx.post.findUnique({
        where: {
          id: postId,
          status: PostStatus.PUBLISHED,
        },
        include: {
          comments: {
            where: {
              parentId: null,
              status: CommentStatus.APPROVED,
            },
            orderBy: { createdAt: "desc" },
            include: {
              replies: {
                where: {
                  status: CommentStatus.APPROVED,
                },
                orderBy: { createdAt: "asc" },
                include: {
                  replies: {
                    where: {
                      status: CommentStatus.APPROVED,
                    },
                    orderBy: { createdAt: "asc" },
                  },
                },
              },
            },
          },
          _count: {
            select: { comments: true },
          },
        },
      });
      return postData;
    });
  } catch (error) {
    console.log(error);
  }
};

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
  return result;
};

const myPosts = async () => {
  console.log("my posts");
};

export const PostServices = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  myPosts,
};
