/**
 * System User / Laboratory Staff grid row model for server-side pagination.
 */
export interface UserRow {
  id: number;
  uid?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  emailAddress: string;
  phoneNumber?: string;
  address?: string;
  passportNo?: string;
  nationalId?: string;
  employeeCode?: string;
  departmentId?: number;
  departmentName?: string;
  designationId?: number;
  designationName?: string;
  branchId?: number;
  branchName?: string;
  roleNames?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

/**
 * Payload for registering a new user / staff member account.
 */
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  emailAddress: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  passportNo?: string;
  nationalId?: string;
  employeeCode?: string;
  departmentId?: number;
  designationId?: number;
  branchId?: number;
  roleIds?: number[];
  isActive?: boolean;
}

/**
 * Response returned from creating a new user account containing minimal identification info.
 */
export interface CreateUserResponse {
  id: number;
}

/**
 * Detailed user response for editing.
 */
export interface UserDetail {
  id: number;
  uid?: string;
  firstName: string;
  lastName: string;
  username: string;
  emailAddress: string;
  isActive: boolean;
  phoneNumber?: string;
  address?: string;
  passportNo?: string;
  nationalId?: string;
  employeeCode?: string;
  departmentId?: number;
  departmentName?: string;
  designationId?: number;
  designationName?: string;
  branchId?: number;
  branchName?: string;
  roleIds: number[];
  roleNames: string[];
  lastLoginAt?: string;
  createdAt: string;
}

/**
 * Payload for updating an existing user / staff member account.
 */
export interface UpdateUserPayload {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  emailAddress: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  passportNo?: string;
  nationalId?: string;
  employeeCode?: string;
  departmentId?: number;
  designationId?: number;
  branchId?: number;
  roleIds?: number[];
  isActive: boolean;
}

/**
 * Response returned from updating a user account containing minimal identification info.
 */
export interface UpdateUserResponse {
  id: number;
}

/**
 * Security role lookup model.
 */
export interface RoleLookup {
  id: number;
  name: string;
  description?: string;
}
