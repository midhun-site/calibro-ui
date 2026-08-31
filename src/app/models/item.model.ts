/**
 * Represents a stock item or master equipment record returned from the backend API.
 */
export interface Item {
  id: number;
  uid: string;
  itemCode: string;
  itemName: string;
  modelNo?: string;
  unit?: string;
  supplier?: string;
  remarks?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Payload sent to create or update a stock item.
 */
export interface SaveItemPayload {
  id: number | null;
  itemCode: string;
  itemName: string;
  modelNo?: string;
  unit?: string;
  supplier?: string;
  remarks?: string;
  isActive: boolean;
}

/**
 * Response payload returned upon saving an item.
 */
export interface SaveItemResponse {
  id: number;
  uid: string;
  itemCode: string;
  message: string;
}

/**
 * Common unit of measurement option for stock items.
 */
export interface UnitOption {
  label: string;
  value: string;
}

/**
 * Supplier lookup option.
 */
export interface SupplierOption {
  label: string;
  value: string;
}
