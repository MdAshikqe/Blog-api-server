// import { UserRole, UserStatus } from "../../../prisma/generated/prisma/enums";

import { UserRole, UserStatus } from "../../../prisma/generated/prisma/enums";

export type IAuthUser = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isDeleted: boolean;
  emailVerified: boolean;
};
