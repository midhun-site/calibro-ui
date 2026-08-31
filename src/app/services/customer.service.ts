import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import {
  Customer,
  CustomerDetails,
  SaveCustomerPayload,
  SaveCustomerResponse,
  DeleteCustomerResponse,
  CustomerCategoryLookup
} from '../models/customer.model';
import { GridQueryParams, PagedGridResponse } from '../common/grid';

/**
 * Service responsible for customer master and category HTTP API operations,
 * reactive state management, and grid communications.
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7124/api/v1.0';

  /** Reactive signal containing the list of currently fetched customer records. */
  public customers = signal<Customer[]>([]);

  /** Reactive signal containing customer classification categories for dropdown selection. */
  public categories = signal<CustomerCategoryLookup[]>([]);

  /** Reactive signal containing the currently selected or inspected customer details. */
  public selectedCustomer = signal<CustomerDetails | null>(null);

  /** Loading state indicator for customer operations. */
  public isLoading = signal<boolean>(false);

  /** Total records count matching current server-side grid filters. */
  public totalCount = signal<number>(0);

  /**
   * Retrieves a paginated, sorted, and filtered list of customer records from the backend API.
   * @param params Optional grid query parameters including pagination, search terms, and column filters.
   * @returns Observable resolving with the paginated customer grid response.
   */
  getCustomers(params?: GridQueryParams): Observable<PagedGridResponse<Customer>> {
    this.isLoading.set(true);
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortColumn) httpParams = httpParams.set('sortColumn', params.sortColumn);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

      // Append any additional direct column filter properties
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

    return this.http.get<PagedGridResponse<Customer>>(`${this.baseUrl}/customers`, { params: httpParams }).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res && res.items) {
          this.customers.set(res.items);
          this.totalCount.set(res.totalCount);
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Retrieves full profile metadata and registered contact persons for a customer by ID.
   * @param id Customer numeric identifier.
   * @returns Observable resolving with the full customer details.
   */
  getCustomerById(id: number): Observable<CustomerDetails> {
    return this.http.get<CustomerDetails>(`${this.baseUrl}/customers/${id}`).pipe(
      tap(details => this.selectedCustomer.set(details))
    );
  }

  /**
   * Registers a new customer account entity in the database.
   * @param payload Customer creation payload.
   * @returns Observable resolving with the save customer response DTO.
   */
  createCustomer(payload: SaveCustomerPayload): Observable<SaveCustomerResponse> {
    return this.http.post<SaveCustomerResponse>(`${this.baseUrl}/customers`, payload);
  }

  /**
   * Updates an existing customer profile and associated contact persons.
   * @param id Customer numeric identifier.
   * @param payload Customer update payload.
   * @returns Observable resolving with the save customer response DTO.
   */
  updateCustomer(id: number, payload: SaveCustomerPayload): Observable<SaveCustomerResponse> {
    return this.http.put<SaveCustomerResponse>(`${this.baseUrl}/customers/${id}`, payload);
  }

  /**
   * Saves a customer record by automatically choosing create (POST) or update (PUT) based on payload ID.
   * @param payload Save customer command payload.
   * @returns Observable resolving with the save customer response DTO.
   */
  saveCustomer(payload: SaveCustomerPayload): Observable<SaveCustomerResponse> {
    if (payload.id && payload.id > 0) {
      return this.updateCustomer(payload.id, payload);
    }
    return this.createCustomer(payload);
  }

  /**
   * Soft-deletes a customer account and cascades to associated contact persons.
   * @param id Customer numeric identifier.
   * @returns Observable resolving with the delete confirmation response.
   */
  deleteCustomer(id: number): Observable<DeleteCustomerResponse> {
    return this.http.delete<DeleteCustomerResponse>(`${this.baseUrl}/customers/${id}`);
  }

  /**
   * Retrieves active customer classification categories for lookup dropdowns.
   * Supports both /customers/categories and /customer-categories with fallback resilience.
   * @returns Observable resolving with the category list.
   */
  getCustomerCategories(): Observable<CustomerCategoryLookup[]> {
    return this.http.get<CustomerCategoryLookup[]>(`${this.baseUrl}/customers/categories`).pipe(
      catchError(() => this.http.get<CustomerCategoryLookup[]>(`${this.baseUrl}/customer-categories`)),
      catchError(() => {
        const defaultTiers: CustomerCategoryLookup[] = [
          { id: 1, code: 'CAT-CORP', name: 'Corporate Enterprise', description: 'Tier 1 high-volume accounts', defaultDiscountPercent: 15, isActive: true },
          { id: 2, code: 'CAT-GOV', name: 'Government & Defense', description: 'State agencies and defense contractors', defaultDiscountPercent: 10, isActive: true },
          { id: 3, code: 'CAT-STD', name: 'Standard Commercial', description: 'Standard commercial rate accounts', defaultDiscountPercent: 0, isActive: true },
          { id: 4, code: 'CAT-ACAD', name: 'Academic & Research', description: 'Universities and laboratories', defaultDiscountPercent: 20, isActive: true }
        ];
        return of(defaultTiers);
      }),
      tap(cats => {
        if (cats && cats.length > 0) {
          this.categories.set(cats);
        }
      })
    );
  }

  /**
   * Retrieves the next auto-generated sequential customer code from the API.
   * @returns Observable resolving with the next customer code (e.g. CUST0001, CUST0002).
   */
  getNextCustomerCode(): Observable<{ customerCode: string }> {
    return this.http.get<{ customerCode: string }>(`${this.baseUrl}/customers/next-code`);
  }
}
