export interface IUserFilter {
  searchTerm?: string;
  email?: string;
  role?: string;
  status?: string;
  name?: string;
  emailVerified?: boolean;
  isVerified?: boolean;
}
export interface IUserPagination {
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  totalPages?: number;
}
