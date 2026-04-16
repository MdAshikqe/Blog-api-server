import { Prisma, User } from "../../../../prisma/generated/prisma/client";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { IUserFilter, IUserPagination } from "./user.interface";
import { PaginationHelper } from "../../helpers/paginationHelper";
import { userSearchAbleFields } from "./user.constant";
import { resourceUsage } from "node:process";

const createClient = async (payload: any) => {
  const hashPassword = await bcrypt.hash(payload.password, 10);
  const userData = {
    name: payload.client.name,
    email: payload.client.email,
    password: hashPassword,
    role: UserRole.CLIENT,
  };

  const result = await prisma.$transaction(async (transactinClient) => {
    await transactinClient.user.create({
      data: userData,
    });
    const createClient = await transactinClient.client.create({
      data: payload.client,
    });
    return createClient;
  });

  return result;
};

const createAdmin = async (payload: any) => {
  const hashPassword = await bcrypt.hash(payload.password, 10);

  const userData = {
    name: payload.admin.name,
    email: payload.admin.email,
    password: hashPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactinClient) => {
    await transactinClient.user.create({
      data: userData,
    });
    const createAdminResult = await transactinClient.admin.create({
      data: payload.admin,
    });
    return createAdminResult;
  });
  return result;
};

// const getAllUser = async () => {
//   const result = await prisma.user.findMany({
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       emailVerified: true,
//       role: true,
//       status: true,
//       needPasswordChange: true,
//       isVerified: true,
//       createdAt: true,
//       updatedAt: true,
//       deletedAt: true,
//       isDeleted: true,
//     },
//   });
//   return result;
// };

const getAllUser = async (params: IUserFilter, options: IUserPagination) => {
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
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
  const whereCondition: Prisma.UserWhereInput = { AND: andConditions };

  const total = await prisma.user.count({
    where: whereCondition,
  });

  const { page, limit, sortBy, sortOrder, skip, totalPages } =
    PaginationHelper.calculatepagination(options, total);

  const result = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      role: true,
      status: true,
      needPasswordChange: true,
      emailVerified: true,
      isDeleted: true,
      isVerified: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
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

const getById = async (id: string) => {
  const result = await prisma.user.findFirstOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      role: true,
      status: true,
      needPasswordChange: true,
      emailVerified: true,
      isDeleted: true,
      isVerified: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

export const UserService = {
  createClient,
  createAdmin,
  getAllUser,
  getById,
};
