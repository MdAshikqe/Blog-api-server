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
export interface IRegisterAdminPayload {
  name: string;
  email: string;
  password: string;
}

export type IAuthUser = {
  email: string;
  role: UserRole;
};

export type IChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type IResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};
