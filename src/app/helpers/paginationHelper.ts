type IOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

type IOptionResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
  totalPages: number;
};
const calculatepagination = (
  options: IOptions,
  total: number,
): IOptionResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 10;
  const skip: number = (Number(page) - 1) * limit;

  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: string = options.sortOrder || "desc";
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
    totalPages,
  };
};

export const PaginationHelper = {
  calculatepagination,
};
