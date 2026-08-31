/**
 * Generic lookup classification categories.
 */
export enum LookupType {
  UnitOfMeasure = 1,
  EquipmentCategory = 2,
  PriorityLevel = 3,
  PaymentTerm = 4
}

/**
 * Generic lookup item returned by the backend API.
 */
export interface LookupItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
  type: LookupType;
  sortOrder: number;
}
