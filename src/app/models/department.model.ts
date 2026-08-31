/**
 * Department reference model for organizational hierarchy and staff mapping.
 */
export interface DepartmentLookup {
  id: number;
  uid?: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Designation / Job Title reference model.
 */
export interface DesignationLookup {
  id: number;
  uid?: string;
  code: string;
  name: string;
  description?: string;
  departmentId?: number;
  departmentName?: string;
  isActive?: boolean;
}
