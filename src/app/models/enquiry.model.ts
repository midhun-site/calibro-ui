import { GridQueryParams, PagedGridResponse } from '../common/grid';

/**
 * Interface representing an individual enquiry record in the UI data grid.
 */
export interface EnquiryRow {
  id?: number;
  uid?: string;
  enquiryNo: string;
  revNo?: string;
  revDate?: string;
  customer: string;
  customerCode?: string;
  contactPersonName?: string;
  email?: string;
  receivedDate: string;
  instrumentsCount: string;
  totalItemsCount?: number;
  serviceType: string;
  mode?: string;
  status: string;
  createdAt?: string;
}

/**
 * Detailed line item specification for an enquiry.
 */
export interface EnquiryItemDetail {
  id?: number;
  slNo: number;
  itemId?: number | null;
  itemCode?: string;
  itemName: string;
  serialNo?: string;
  roTagNo?: string;
  make?: string;
  model?: string;
  range?: string;
  qty: number;
  remarks?: string;
}

/**
 * Full details of a Calibration Enquiry including header and line items.
 */
export interface EnquiryDetail {
  id: number;
  uid?: string;
  enquiryNo: string;
  revNo: string;
  revDate?: string;
  enqDate: string;
  modeId?: number | null;
  mode: string;
  natureId?: number | null;
  nature: string;
  statusId?: number | null;
  status: string;
  customerId?: number | string | null;
  customerCode: string;
  clientName: string;
  address?: string;
  poBox?: string;
  contactPersonId?: number | null;
  contactPersonName?: string;
  email?: string;
  telNo?: string;
  fax?: string;
  designation?: string;
  department?: string;
  reference?: string;
  forTcp: boolean;
  remarks?: string;
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  items: EnquiryItemDetail[];
}

/**
 * Payload for creating a new Calibration Enquiry.
 */
export interface CreateEnquiryPayload {
  enquiryNo?: string;
  modeId?: number | null;
  mode?: string;
  natureId?: number | null;
  nature?: string;
  statusId?: number | null;
  status?: string;
  customerId?: number | string | null;
  customerCode?: string;
  clientName?: string;
  address?: string;
  poBox?: string;
  contactPersonId?: number | null;
  contactPersonName?: string;
  email?: string;
  telNo?: string;
  fax?: string;
  designation?: string;
  department?: string;
  reference?: string;
  forTcp?: boolean;
  remarks?: string;
  items: EnquiryItemDetail[];
}

/**
 * Response returned from creating an enquiry.
 */
export interface CreateEnquiryResponse {
  id: number;
  uid?: string;
  enquiryNo: string;
  revNo: string;
  clientName: string;
  totalItems: number;
  message: string;
}

/**
 * Payload for updating an existing Calibration Enquiry.
 */
export interface UpdateEnquiryPayload {
  id: number;
  enquiryNo: string;
  revNo: string;
  revDate?: string;
  modeId?: number | null;
  mode?: string;
  natureId?: number | null;
  nature?: string;
  statusId?: number | null;
  status?: string;
  customerId?: number | string | null;
  customerCode?: string;
  clientName?: string;
  address?: string;
  poBox?: string;
  contactPersonId?: number | null;
  contactPersonName?: string;
  email?: string;
  telNo?: string;
  fax?: string;
  designation?: string;
  department?: string;
  reference?: string;
  forTcp?: boolean;
  remarks?: string;
  items: EnquiryItemDetail[];
}

/**
 * Response returned from updating an enquiry.
 */
export interface UpdateEnquiryResponse {
  id: number;
  uid?: string;
  enquiryNo: string;
  revNo: string;
  clientName: string;
  totalItems: number;
  message: string;
}

/**
 * Response returned from deleting an enquiry.
 */
export interface DeleteEnquiryResponse {
  id: number;
  enquiryNo: string;
  message: string;
}

/**
 * Filter query payload for fetching paginated enquiries.
 */
export interface EnquiryQueryFilter extends GridQueryParams {
  enquiryNo?: string;
  customer?: string;
  serviceType?: string;
  status?: string;
  receivedDate?: string;
}

/**
 * Paginated API response structure for enquiries.
 */
export type EnquiryListResponse = PagedGridResponse<EnquiryRow>;
