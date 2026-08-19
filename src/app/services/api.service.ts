import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Customer, CreateCustomerPayload } from '../models/customer.model';
import { CustomerEquipment, CreateEquipmentPayload } from '../models/equipment.model';
import { DashboardStats } from '../models/dashboard.model';

export type { Customer, CreateCustomerPayload } from '../models/customer.model';
export type { CustomerEquipment, CreateEquipmentPayload } from '../models/equipment.model';

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

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`).pipe(
      tap(stats => this.dashboardStats.set(stats))
    );
  }

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
}
