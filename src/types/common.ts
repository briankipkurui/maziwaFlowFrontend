export interface BaseResponse {
  message: string;
}

export interface ApiError {
  hasActiveSession?: boolean;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  totalItems: number;
  results: T[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  limit: number;
}
