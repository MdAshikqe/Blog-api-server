import { Request, Response } from "express";
import { UserService } from "./user.service";

const createClient = async (req: Request, res: Response) => {
  const result = await UserService.createClient();

  res.send(200).json({
    success: true,
    message: "Client create successfully",
    data: result,
  });
};

export const UserController = {
  createClient,
};
