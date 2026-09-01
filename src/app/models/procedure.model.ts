/**
 * Represents a Quality Control calibration procedure record.
 */
export interface ProcedureItem {
  id: number;
  uid: string;
  lab: string;
  procedureType: string;
  procedureNumber: string;
  calibrationProcedure: string;
  revision: string;
  branchId: number | null;
  branchName?: string | null;
  isActive: boolean;
  createdAt: string;
}

/**
 * Payload for creating or updating a calibration procedure.
 */
export interface SaveProcedurePayload {
  id: number;
  lab: string;
  procedureType: string;
  procedureNumber: string;
  calibrationProcedure: string;
  revision: string;
  branchId?: number | null;
  isActive: boolean;
}

/**
 * Paginated response wrapper from backend GET /api/v1.0/procedures.
 */
export interface PagedProcedureResponse {
  items: ProcedureItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  executionTimeMs: number;
}
