import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Customer, CreateCustomerPayload } from '../models/customer.model';
import { CustomerEquipment, CreateEquipmentPayload } from '../models/equipment.model';
import { DashboardStats } from '../models/dashboard.model';
import { CompanySettings, UpdateCompanySettingsPayload } from '../models/company-settings.model';
import { Branch, SaveBranchPayload, DeleteBranchResponse } from '../models/branch.model';
import { EnquiryRow, EnquiryQueryFilter, EnquiryListResponse } from '../models/enquiry.model';
import { CountryLookup } from '../models/country.model';
import { GridQueryParams, PagedGridResponse } from '../common/grid';

import { environment } from '../../environments/environment';

export type { Customer, CreateCustomerPayload } from '../models/customer.model';
export type { CustomerEquipment, CreateEquipmentPayload } from '../models/equipment.model';
export type { CompanySettings, UpdateCompanySettingsPayload } from '../models/company-settings.model';
export type { Branch, SaveBranchPayload, DeleteBranchResponse } from '../models/branch.model';
export type { EnquiryRow, EnquiryQueryFilter, EnquiryListResponse } from '../models/enquiry.model';
export type { CountryLookup } from '../models/country.model';
export type { GridQueryParams, PagedGridResponse } from '../common/grid';

/**
 * Service managing HTTP client interactions with the CaliBro .NET 10 Web API backend.
 * Provides reactive signals for store management and observable methods for mutations.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Signals for reactive store
  public dashboardStats = signal<DashboardStats | null>(null);
  public customers = signal<Customer[]>([]);
  public equipments = signal<CustomerEquipment[]>([]);
  public companySettings = signal<CompanySettings | null>(null);
  public branches = signal<Branch[]>([]);
  public countries = signal<CountryLookup[]>([]);

  // -------------------------------------------------------------
  // Dashboard & Statistics
  // -------------------------------------------------------------
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`).pipe(
      tap(stats => this.dashboardStats.set(stats))
    );
  }

  // -------------------------------------------------------------
  // Customers
  // -------------------------------------------------------------
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`).pipe(
      tap(custs => this.customers.set(custs))
    );
  }

  createCustomer(payload: CreateCustomerPayload): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/customers`, payload).pipe(
      tap(() => this.getCustomers().subscribe())
    );
  }

  // -------------------------------------------------------------
  // Equipment
  // -------------------------------------------------------------
  getEquipments(customerId?: string): Observable<CustomerEquipment[]> {
    const url = customerId ? `${this.baseUrl}/equipments?customerId=${customerId}` : `${this.baseUrl}/equipments`;
    return this.http.get<CustomerEquipment[]>(url).pipe(
      tap(eqs => this.equipments.set(eqs))
    );
  }

  createEquipment(payload: CreateEquipmentPayload): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/equipments`, payload).pipe(
      tap(() => this.getEquipments().subscribe())
    );
  }

  // -------------------------------------------------------------
  // Company Settings Endpoints
  // -------------------------------------------------------------
  /**
   * Retrieves active company profile, tax identification, and settings.
   */
  getCompanySettings(): Observable<CompanySettings> {
    return this.http.get<CompanySettings>(`${this.baseUrl}/company-settings`).pipe(
      tap(settings => this.companySettings.set(settings))
    );
  }

  /**
   * Updates company legal details, address, and defaults.
   * @param payload Update company settings command payload.
   */
  updateCompanySettings(payload: UpdateCompanySettingsPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/company-settings`, payload).pipe(
      tap(() => this.getCompanySettings().subscribe())
    );
  }

  // -------------------------------------------------------------
  // Branch Management Endpoints (Database-backed Grid)
  // -------------------------------------------------------------
  /**
   * Retrieves paginated laboratory branch facilities from the database.
   * @param params Grid query parameters or optional active status filter.
   */
  getBranches(params?: GridQueryParams | boolean): Observable<PagedGridResponse<Branch>> {
    let httpParams = new HttpParams();

    if (typeof params === 'boolean') {
      httpParams = httpParams.set('isActive', params.toString());
    } else if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortColumn) httpParams = httpParams.set('sortColumn', params.sortColumn);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

      // Append any additional column filter properties
      for (const key of Object.keys(params)) {
        if (!['pageNumber', 'pageSize', 'searchTerm', 'sortColumn', 'sortDirection', 'columnFilters'].includes(key)) {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            const val = params[key].toString();
            httpParams = httpParams.set(key, val);
            httpParams = httpParams.set(`ColumnFilters[${key}]`, val);
          }
        }
      }
      if (params.columnFilters) {
        for (const [col, val] of Object.entries(params.columnFilters)) {
          if (val) {
            httpParams = httpParams.set(col, val);
            httpParams = httpParams.set(`ColumnFilters[${col}]`, val);
          }
        }
      }
    }

    return this.http.get<PagedGridResponse<Branch>>(`${this.baseUrl}/branches`, { params: httpParams }).pipe(
      tap(res => {
        if (res && res.items) {
          this.branches.set(res.items);
        }
      })
    );
  }

  /**
   * Retrieves details for a specific branch facility by ID.
   * @param id Branch numeric identifier.
   */
  getBranchById(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.baseUrl}/branches/${id}`);
  }

  /**
   * Registers a new branch facility location.
   * @param payload Save branch command payload.
   */
  createBranch(payload: SaveBranchPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/branches`, payload);
  }

  /**
   * Updates an existing branch facility location.
   * @param id Branch numeric identifier.
   * @param payload Save branch command payload.
   */
  updateBranch(id: number, payload: SaveBranchPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/branches/${id}`, payload);
  }

  /**
   * Soft deletes a branch facility.
   * @param id Branch numeric identifier.
   */
  deleteBranch(id: number): Observable<DeleteBranchResponse> {
    return this.http.delete<DeleteBranchResponse>(`${this.baseUrl}/branches/${id}`);
  }

  // -------------------------------------------------------------
  // Countries Reference Endpoint
  // -------------------------------------------------------------
  /**
   * Retrieves all active countries for lookup dropdowns and reference data.
   */
  getCountries(): Observable<CountryLookup[]> {
    return this.http.get<CountryLookup[]>(`${this.baseUrl}/countries`).pipe(
      tap(list => this.countries.set(list))
    );
  }

  // -------------------------------------------------------------
  // Calibration Enquiries (1-Million In-Memory Benchmark Store)
  // -------------------------------------------------------------
  /**
   * Retrieves paginated calibration enquiries from the 1,000,000 in-memory benchmark repository.
   * @param filter Pagination, search, and sorting criteria.
   */
  getEnquiries(filter: EnquiryQueryFilter): Observable<EnquiryListResponse> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.enquiryNo) params = params.set('enquiryNo', filter.enquiryNo);
    if (filter.customer) params = params.set('customer', filter.customer);
    if (filter.serviceType) params = params.set('serviceType', filter.serviceType);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.sortColumn) params = params.set('sortColumn', filter.sortColumn);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);

    return this.http.get<EnquiryListResponse>(`${this.baseUrl}/enquiries`, { params });
  }
}
