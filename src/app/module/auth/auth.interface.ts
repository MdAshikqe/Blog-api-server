import { UserRole } from "../../../../prisma/generated/prisma/enums";

export type ILogin = {
  email: string;
  password: string;
};

export interface IRegisterClientPayload {
  name: string;
  email: string;
  password: string;
}

export type IAuthUser = {
  email: string;
  role: UserRole;
};
