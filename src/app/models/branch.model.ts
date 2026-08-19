/**
 * Interface representing a laboratory branch facility DTO from backend API.
 */
export interface Branch {
  id: number;
  uid?: string;
  companyId: number;
  companyName?: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  countryId?: number;
  countryName?: string;
  isMainBranch: boolean;
  isActive: boolean;
}

/**
 * Payload interface for registering or updating a branch facility.
 */
export interface SaveBranchPayload {
  id?: number;
  companyId?: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  countryId?: number;
  isMainBranch: boolean;
  isActive: boolean;
}

/**
 * Interface representing a deletion response DTO.
 */
export interface DeleteBranchResponse {
  id: number;
  message: string;
}
