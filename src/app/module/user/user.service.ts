import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

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

export const UserService = {
  createClient,
};
