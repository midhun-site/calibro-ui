/**
 * Interface representing company profile and settings response DTO from backend API.
 */
export interface CompanySettings {
  id: number;
  uid?: string;
  code: string;
  name: string;
  taxNumber?: string;
  registrationNumber?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  countryId?: number;
  countryName?: string;
  currencyId?: number;
  currencyCode?: string;
  isActive: boolean;
  branchCount: number;
}

/**
 * Payload interface for updating company settings.
 */
export interface UpdateCompanySettingsPayload {
  id?: number;
  name: string;
  taxNumber?: string;
  registrationNumber?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  countryId?: number;
  currencyId?: number;
  isActive?: boolean;
}
