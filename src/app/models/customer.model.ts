/**
/// Model definition for customer records in CaliBro.
*/
export interface Customer {
  id: string | number;
  uid?: string;
  code: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string | null;
  customerCategoryId?: number | null;
  customerCategoryName?: string | null;
  totalContacts?: number;
  totalEquipments?: number;
  activeWorkOrders?: number;
  createdAt?: string;
}

/**
 * Model representing a customer contact person representative.
 */
export interface CustomerContact {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  isPrimary: boolean;
}

/**
 * Detailed customer profile model returned by GET by ID.
 */
export interface CustomerDetails {
  id: number;
  uid?: string;
  code: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string | null;
  customerCategoryId?: number | null;
  customerCategoryName?: string | null;
  createdAt?: string;
  contacts: CustomerContact[];
}

/**
 * Payload sent to backend API to create or update a customer record.
 */
export interface SaveCustomerPayload {
  id?: number | null;
  code: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string | null;
  customerCategoryId?: number | null;
  contacts?: CustomerContact[];
}

/**
 * Response payload returned after saving a customer.
 */
export interface SaveCustomerResponse {
  id: number;
  uid?: string;
  code: string;
  companyName: string;
  message: string;
}

/**
 * Response payload returned after soft-deleting a customer.
 */
export interface DeleteCustomerResponse {
  id: number;
  success: boolean;
  message: string;
}

/**
 * Reference model for customer classification categories.
 */
export interface CustomerCategoryLookup {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  defaultDiscountPercent: number;
  isActive: boolean;
}

/**
 * Reference model for country lookups.
 */
export interface CountryLookup {
  id: number;
  code: string;
  name: string;
  phoneCode?: string | null;
  isActive: boolean;
}

/**
 * Backward compatibility interface for legacy callers.
 */
export interface CreateCustomerPayload {
  code: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string;
}
