/**
 * Interface representing an individual enquiry record in the UI.
 */
export interface EnquiryRow {
  enquiryNo: string;
  customer: string;
  receivedDate: string;
  instrumentsCount: string;
  serviceType: string;
  status: string;
}

/**
 * Filter query payload for fetching paginated enquiries.
 */
export interface EnquiryQueryFilter {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  enquiryNo?: string;
  customer?: string;
  serviceType?: string;
  status?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Paginated API response structure for enquiries benchmark.
 */
export interface EnquiryListResponse {
  items: EnquiryRow[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  executionTimeMs: number;
  benchmarkDatasetSize: number;
}
