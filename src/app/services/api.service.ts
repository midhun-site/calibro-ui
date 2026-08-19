import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Customer, CreateCustomerPayload } from '../models/customer.model';
import { CustomerEquipment, CreateEquipmentPayload } from '../models/equipment.model';
import { DashboardStats } from '../models/dashboard.model';
import { CompanySettings, UpdateCompanySettingsPayload } from '../models/company-settings.model';
import { Branch, SaveBranchPayload, DeleteBranchResponse } from '../models/branch.model';

export type { Customer, CreateCustomerPayload } from '../models/customer.model';
export type { CustomerEquipment, CreateEquipmentPayload } from '../models/equipment.model';
export type { CompanySettings, UpdateCompanySettingsPayload } from '../models/company-settings.model';
export type { Branch, SaveBranchPayload, DeleteBranchResponse } from '../models/branch.model';

/**
 * Service managing HTTP client interactions with the CaliBro .NET 10 Web API backend.
 * Provides reactive signals for store management and observable methods for mutations.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7124/api/v1.0'; // Standard ASP.NET Core HTTPS port with v1.0 API version

  // Signals for reactive store
  public dashboardStats = signal<DashboardStats | null>(null);
  public customers = signal<Customer[]>([]);
  public equipments = signal<CustomerEquipment[]>([]);
  public companySettings = signal<CompanySettings | null>(null);
  public branches = signal<Branch[]>([]);

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
  // Branch Management Endpoints
  // -------------------------------------------------------------
  /**
   * Retrieves all laboratory branch facilities.
   * @param isActive Optional filter by active status.
   */
  getBranches(isActive?: boolean): Observable<Branch[]> {
    const url = isActive !== undefined ? `${this.baseUrl}/branches?isActive=${isActive}` : `${this.baseUrl}/branches`;
    return this.http.get<Branch[]>(url).pipe(
      tap(branches => this.branches.set(branches))
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
    return this.http.post<any>(`${this.baseUrl}/branches`, payload).pipe(
      tap(() => this.getBranches().subscribe())
    );
  }

  /**
   * Updates an existing branch facility location.
   * @param id Branch numeric identifier.
   * @param payload Save branch command payload.
   */
  updateBranch(id: number, payload: SaveBranchPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/branches/${id}`, payload).pipe(
      tap(() => this.getBranches().subscribe())
    );
  }

  /**
   * Soft deletes a branch facility.
   * @param id Branch numeric identifier.
   */
  deleteBranch(id: number): Observable<DeleteBranchResponse> {
    return this.http.delete<DeleteBranchResponse>(`${this.baseUrl}/branches/${id}`).pipe(
      tap(() => this.getBranches().subscribe())
    );
  }
}
