import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EnquiryRow,
  EnquiryDetail,
  CreateEnquiryPayload,
  CreateEnquiryResponse,
  UpdateEnquiryPayload,
  UpdateEnquiryResponse,
  DeleteEnquiryResponse,
  EnquiryListResponse
} from '../models/enquiry.model';
import { GridQueryParams } from '../common/grid';
import { environment } from '../../environments/environment';

/**
 * Service managing Calibration Enquiry operations with the .NET 10 Web API backend.
 */
@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/enquiries`;

  /**
   * Retrieves paginated, sorted, and filtered calibration enquiries from the database.
   * @param params Grid query pagination, sorting, and filter parameters.
   */
  getEnquiries(params: GridQueryParams): Observable<EnquiryListResponse> {
    let httpParams = new HttpParams()
      .set('pageNumber', (params.pageNumber || 1).toString())
      .set('pageSize', (params.pageSize || 15).toString());

    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params.sortColumn) httpParams = httpParams.set('sortColumn', params.sortColumn);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

    if (params.columnFilters) {
      Object.keys(params.columnFilters).forEach(key => {
        const val = params.columnFilters![key];
        if (val !== undefined && val !== null && val !== '') {
          httpParams = httpParams.set(key, val.toString());
        }
      });
    }

    return this.http.get<EnquiryListResponse>(this.baseUrl, { params: httpParams });
  }

  /**
   * Retrieves the next auto-generated unique enquiry number from the server.
   */
  getNextEnquiryNo(): Observable<{ nextEnquiryNo: string }> {
    return this.http.get<{ nextEnquiryNo: string }>(`${this.baseUrl}/next-number`);
  }

  /**
   * Retrieves full profile details and line items for an enquiry by its numeric ID.
   * @param id Enquiry numeric ID.
   */
  getEnquiryById(id: number | string): Observable<EnquiryDetail> {
    return this.http.get<EnquiryDetail>(`${this.baseUrl}/${id}`);
  }

  /**
   * Retrieves full profile details and line items for an enquiry by its alphanumeric enquiry code.
   * @param enquiryNo Enquiry alphanumeric code (e.g., ENQ-2026-0001).
   */
  getEnquiryByNumber(enquiryNo: string): Observable<EnquiryDetail> {
    return this.http.get<EnquiryDetail>(`${this.baseUrl}/by-number/${encodeURIComponent(enquiryNo)}`);
  }

  /**
   * Creates a new Calibration Enquiry record with line items.
   * @param payload Create enquiry payload.
   */
  createEnquiry(payload: CreateEnquiryPayload): Observable<CreateEnquiryResponse> {
    return this.http.post<CreateEnquiryResponse>(this.baseUrl, payload);
  }

  /**
   * Updates an existing Calibration Enquiry record and line items.
   * @param id Enquiry numeric ID.
   * @param payload Update enquiry payload.
   */
  updateEnquiry(id: number | string, payload: UpdateEnquiryPayload): Observable<UpdateEnquiryResponse> {
    return this.http.put<UpdateEnquiryResponse>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Soft-deletes a Calibration Enquiry by numeric ID or alphanumeric enquiry number.
   * @param idOrNumber Enquiry numeric ID or string code (e.g., ENQ-2026-0001).
   */
  deleteEnquiry(idOrNumber: number | string): Observable<DeleteEnquiryResponse> {
    if (typeof idOrNumber === 'number' || (!isNaN(Number(idOrNumber)) && Number(idOrNumber) > 0)) {
      return this.http.delete<DeleteEnquiryResponse>(`${this.baseUrl}/${idOrNumber}`);
    }
    return this.http.delete<DeleteEnquiryResponse>(`${this.baseUrl}/by-number/${encodeURIComponent(idOrNumber)}`);
  }
}
