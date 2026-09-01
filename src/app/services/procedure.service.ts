import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ProcedureItem, SaveProcedurePayload, PagedProcedureResponse } from '../models/procedure.model';
import { GridQueryParams, PagedGridResponse } from '../common/grid';
import { environment } from '../../environments/environment';

export type { ProcedureItem, SaveProcedurePayload, PagedProcedureResponse } from '../models/procedure.model';

/**
 * Service managing QC Calibration Procedure / SOP records.
 * Connects to versioned /api/v1.0/procedures backend endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class ProcedureService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/procedures`;

  /** Reactive collection of procedure items in the active view */
  public procedures = signal<ProcedureItem[]>([]);
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);

  /**
   * Retrieves a paginated, sorted, and filtered list of calibration procedures from the backend API.
   * @param params Optional grid query parameters including pagination, search terms, and column filters.
   * @returns Observable resolving with the paginated procedure grid response.
   */
  getProcedures(params?: GridQueryParams): Observable<PagedGridResponse<ProcedureItem>> {
    this.isLoading.set(true);
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortColumn) httpParams = httpParams.set('sortColumn', params.sortColumn);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

      // Append all filter parameters
      for (const key of Object.keys(params)) {
        if (!['pageNumber', 'pageSize', 'searchTerm', 'sortColumn', 'sortDirection', 'columnFilters'].includes(key)) {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      }

      if (params.columnFilters) {
        for (const [col, val] of Object.entries(params.columnFilters)) {
          if (val !== undefined && val !== null && val !== '') {
            httpParams = httpParams.set(col, val.toString());
          }
        }
      }
    }

    return this.http.get<PagedGridResponse<ProcedureItem>>(this.baseUrl, { params: httpParams }).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res && res.items) {
          this.procedures.set(res.items);
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
   * Retrieves procedure details by numeric ID.
   * @param id Procedure identifier.
   * @returns Observable resolving with detailed procedure record.
   */
  getProcedureById(id: number): Observable<ProcedureItem> {
    return this.http.get<ProcedureItem>(`${this.baseUrl}/${id}`);
  }

  /**
   * Creates a new or updates an existing calibration procedure.
   * @param payload Procedure save payload.
   * @returns Observable resolving with minimal saved procedure ID.
   */
  saveProcedure(payload: SaveProcedurePayload): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, payload);
  }

  /**
   * Deletes a calibration procedure by ID.
   * @param id Procedure identifier.
   * @returns Observable resolving with deletion status.
   */
  deleteProcedure(id: number): Observable<{ id: number; success: boolean }> {
    return this.http.delete<{ id: number; success: boolean }>(`${this.baseUrl}/${id}`);
  }
}
