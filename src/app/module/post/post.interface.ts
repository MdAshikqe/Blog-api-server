import { PostStatus } from "../../../../prisma/generated/prisma/enums";

export interface IPost {
  id: string;
  title: string;
  content: string;
  thumbnail?: string | null;
  isFeatured: boolean;
  tags: string[];
}

export interface IPostPagination {
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  totalPages?: number;
}

export interface IPostFilters {
  searchTerm?: string;
  title?: string;
  content?: string;
  tags?: string[];
  status?: PostStatus;
}
