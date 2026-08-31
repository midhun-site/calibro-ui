import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Item, SaveItemPayload, SaveItemResponse } from '../models/item.model';
import { GridQueryParams, PagedGridResponse } from '../common/grid';

/**
 * Service managing stock items and equipment master REST API interactions.
 */
@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7124/api/v1.0';

  /** Reactive collection of stock items in the active view */
  public items = signal<Item[]>([]);
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);

  /**
   * Retrieves a paginated, sorted, and filtered list of stock items from the backend API.
   * @param params Optional grid query parameters including pagination, search terms, and column filters.
   * @returns Observable resolving with the paginated item grid response.
   */
  getItems(params?: GridQueryParams): Observable<PagedGridResponse<Item>> {
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

    return this.http.get<PagedGridResponse<Item>>(`${this.baseUrl}/items`, { params: httpParams }).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res && res.items) {
          this.items.set(res.items);
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
   * Retrieves full details of a stock item by its identifier.
   * @param id Item numeric database identifier.
   * @returns Observable resolving with the item details.
   */
  getItemById(id: number | string): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/items/${id}`);
  }

  /**
   * Retrieves the next available sequential item identifier code from the API.
   * @returns Observable containing the next item code string.
   */
  getNextItemCode(): Observable<{ itemCode: string }> {
    return this.http.get<{ itemCode: string }>(`${this.baseUrl}/items/next-code`);
  }

  /**
   * Creates a new stock item or updates an existing item record.
   * @param payload Item save command payload.
   * @returns Observable resolving with the save operation response.
   */
  saveItem(payload: SaveItemPayload): Observable<SaveItemResponse> {
    return this.http.post<SaveItemResponse>(`${this.baseUrl}/items`, payload);
  }

  /**
   * Soft-deletes a stock item by ID.
   * @param id Item numeric identifier.
   * @returns Observable resolving upon completion.
   */
  deleteItem(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${id}`);
  }
}
