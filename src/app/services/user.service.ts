import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { UserRow, CreateUserPayload, CreateUserResponse, UpdateUserPayload, UpdateUserResponse, UserDetail } from '../models/user.model';
import { GridQueryParams, PagedGridResponse } from '../common/grid';
import { environment } from '../../environments/environment';

export type { UserRow, CreateUserPayload, CreateUserResponse, UpdateUserPayload, UpdateUserResponse, UserDetail } from '../models/user.model';

/**
 * Service managing system user accounts, laboratory personnel, and metrology staff REST API interactions.
 * Connects to versioned /api/v1.0/users backend endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /** Reactive collection of user rows in the active view */
  public users = signal<UserRow[]>([]);
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);

  /**
   * Retrieves a paginated, sorted, and filtered list of user accounts from the backend API.
   * @param params Optional grid query parameters including pagination, search terms, and column filters.
   * @returns Observable resolving with the paginated user grid response.
   */
  getUsers(params?: GridQueryParams): Observable<PagedGridResponse<UserRow>> {
    this.isLoading.set(true);
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortColumn) httpParams = httpParams.set('sortColumn', params.sortColumn);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

      // Append all direct key-value filter parameters
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

    return this.http.get<PagedGridResponse<UserRow>>(this.baseUrl, { params: httpParams }).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res && res.items) {
          this.users.set(res.items);
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
   * Retrieves complete staff user details by numeric ID.
   * @param id User identifier.
   * @returns Observable resolving with detailed user record.
   */
  getUserById(id: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.baseUrl}/${id}`);
  }

  /**
   * Retrieves the next auto-generated sequential staff employee code (e.g. EMP-0001).
   * @returns Observable containing the next employee code.
   */
  getNextEmployeeCode(): Observable<{ code: string }> {
    return this.http.get<{ code: string }>(`${this.baseUrl}/next-code`);
  }

  /**
   * Creates a new system user or laboratory staff member account.
   * @param payload User creation payload with staff details, department, designation, branch, and roles.
   * @returns Observable resolving with minimal created user identification.
   */
  createUser(payload: CreateUserPayload): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.baseUrl, payload);
  }

  /**
   * Updates an existing user / staff member account.
   * @param id User identifier.
   * @param payload User update payload.
   * @returns Observable resolving with minimal updated user identification.
   */
  updateUser(id: number, payload: UpdateUserPayload): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(`${this.baseUrl}/${id}`, payload);
  }
}
