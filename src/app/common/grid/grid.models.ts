/**
 * Standard query parameters structure sent to backend grid endpoints.
 */
export interface GridQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  columnFilters?: Record<string, string>;
  [key: string]: any;
}

/**
 * Standard paginated response payload returned from backend grid endpoints.
 */
export interface PagedGridResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  executionTimeMs?: number;
  benchmarkDatasetSize?: number;
}

/**
 * Column definition for CSV export and data grid metadata.
 */
export interface GridColumnDef<T> {
  header: string;
  field: keyof T | ((row: T) => string | number | boolean | null | undefined);
  width?: string;
}
