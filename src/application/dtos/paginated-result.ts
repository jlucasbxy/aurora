export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
