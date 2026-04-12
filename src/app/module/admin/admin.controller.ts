import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AdminService } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdmin();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin data retrive successfully",
    data: result,
  });
});

export const AdminController = {
  getAllAdmin,
};
