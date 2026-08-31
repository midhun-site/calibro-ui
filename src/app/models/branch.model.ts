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

  // Branch-Level Document Prefixes
  prefixEnquiry?: string;
  prefixQuotation?: string;
  prefixWorkorder?: string;
  prefixCertificate?: string;
  prefixDeliveryTicket?: string;
  prefixInvoice?: string;

  // Branch-Level Environmental Defaults & Operating Tolerances
  defaultCurrency?: string;
  defaultVatRate?: number;
  defaultCalibPeriodMonths?: number;
  defaultTemp?: string;
  defaultPress?: string;
  defaultHumidity?: string;
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

  prefixEnquiry?: string;
  prefixQuotation?: string;
  prefixWorkorder?: string;
  prefixCertificate?: string;
  prefixDeliveryTicket?: string;
  prefixInvoice?: string;

  defaultCurrency?: string;
  defaultVatRate?: number;
  defaultCalibPeriodMonths?: number;
  defaultTemp?: string;
  defaultPress?: string;
  defaultHumidity?: string;
}

/**
 * Interface representing 1-time immutable document prefixes for a branch.
 */
export interface BranchPrefixResponse {
  id: number;
  branchId: number;
  branchCode: string;
  branchName: string;
  prefixEnquiry?: string;
  prefixQuotation?: string;
  prefixWorkorder?: string;
  prefixCertificate?: string;
  prefixDeliveryTicket?: string;
  prefixInvoice?: string;
  isConfigured: boolean;
  isLocked: boolean;
  configuredAt?: string;
}

/**
 * Command payload for 1-time creation of branch document numbering prefixes.
 */
export interface CreateBranchPrefixPayload {
  branchId: number;
  prefixEnquiry: string;
  prefixQuotation: string;
  prefixWorkorder: string;
  prefixCertificate: string;
  prefixDeliveryTicket: string;
  prefixInvoice: string;
}

/**
 * Response interface after creating branch prefixes.
 */
export interface CreateBranchPrefixResponse {
  id: number;
  branchId: number;
  message: string;
  isLocked: boolean;
}

/**
 * Interface representing a deletion response DTO.
 */
export interface DeleteBranchResponse {
  id: number;
  message: string;
}
