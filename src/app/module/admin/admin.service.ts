import { prisma } from "../../../lib/prisma";

const getAllAdmin = async () => {
  const result = await prisma.admin.findMany({
    include: {
      user: {
        select: {
          id: true,
          emailVerified: true,
          role: true,
          status: true,
          needPasswordChange: true,
          isVerified: true,
          isDeleted: true,
        },
      },
    },
  });
  return result;
};

export const AdminService = {
  getAllAdmin,
};
