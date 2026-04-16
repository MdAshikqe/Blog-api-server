import { Request, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { pick } from "../../shared/pick";
import { userFilterAbleFields, userPaginationFields } from "./user.constant";

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

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin create successfully",
    data: result,
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, userFilterAbleFields);
  const option = pick(req.query, userPaginationFields);
  const result = await UserService.getAllUser(filter, option);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "All user retrive successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User id successfully retrive",
    data: result,
  });
});

export const UserController = {
  createClient,
  createAdmin,
  getAllUser,
  getById,
};
