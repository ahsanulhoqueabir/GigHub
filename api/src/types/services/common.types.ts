export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: unknown;
  status?: number;
}

export interface ServicePagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedServiceResponse<T> extends ServiceResponse<T[]> {
  pagination?: ServicePagination;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}
