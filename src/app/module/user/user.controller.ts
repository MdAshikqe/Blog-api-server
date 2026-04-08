import { Request, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

// const createClient = async (req: Request, res: Response) => {
//   const result = await UserService.createClient();

//   res.status(200).json({
//     success: true,
//     message: "Client create successfully",
//     data: result,
//   });
// };

const createClient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createClient(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Create client successfully",
    data: result,
  });
});

export const UserController = {
  createClient,
};
