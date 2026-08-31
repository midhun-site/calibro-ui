import { computed, signal, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { GridColumnDef, GridQueryParams, PagedGridResponse } from './grid.models';
import { exportGridToCsv } from './grid-export.util';

/**
 * Configuration options for initializing a DataGridState instance.
 */
export interface DataGridOptions<T> {
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  debounceMs?: number;
  columns?: GridColumnDef<T>[];
  fetchFn?: (params: GridQueryParams) => Observable<PagedGridResponse<T>>;
}

/**
 * Reusable reactive state controller for any data grid table.
 * Encapsulates Angular Signals for per-column dynamic filtering, global search,
 * multi-column sorting, debounced data fetching, numbered pagination, and CSV export.
 */
export class DataGridState<T> {
  // Reactive Signals
  public items = signal<T[]>([]);
  public totalCount = signal<number>(0);
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(15);
  public pageSizeOptions = signal<number[]>([10, 15, 25, 50, 100]);
  public sortColumn = signal<string>('');
  public sortDirection = signal<'asc' | 'desc'>('asc');
  public searchTerm = signal<string>('');
  public columnFilters = signal<Record<string, string>>({});
  public isLoading = signal<boolean>(true);
  public executionTimeMs = signal<number>(0);

  // Configuration
  private debounceMs: number = 250;
  private debounceTimer: any = null;
  private fetchFn?: (params: GridQueryParams) => Observable<PagedGridResponse<T>>;
  private columns: GridColumnDef<T>[] = [];

  // Computed Properties
  public totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return size > 0 ? Math.ceil(total / size) || 1 : 1;
  });

  public pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  public showingFrom = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  public showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCount());
  });

  constructor(options?: DataGridOptions<T>) {
    if (options?.defaultSortColumn) this.sortColumn.set(options.defaultSortColumn);
    if (options?.defaultSortDirection) this.sortDirection.set(options.defaultSortDirection);
    if (options?.defaultPageSize) this.pageSize.set(options.defaultPageSize);
    if (options?.pageSizeOptions) this.pageSizeOptions.set(options.pageSizeOptions);
    if (options?.debounceMs !== undefined) this.debounceMs = options.debounceMs;
    if (options?.columns) this.columns = options.columns;
    if (options?.fetchFn) this.fetchFn = options.fetchFn;
  }

  /**
   * Sets or updates the remote data fetching function.
   * @param fn Observable query function accepting GridQueryParams.
   */
  public setFetchFunction(fn: (params: GridQueryParams) => Observable<PagedGridResponse<T>>) {
    this.fetchFn = fn;
  }

  /**
   * Triggers data loading using the current grid state.
   */
  public load(): void {
    if (!this.fetchFn) return;

    this.isLoading.set(true);
    const params = this.getQueryParams();

    this.fetchFn(params).subscribe({
      next: (response: PagedGridResponse<T>) => {
        this.items.set(response.items || []);
        this.totalCount.set(response.totalCount || 0);
        if (response.executionTimeMs !== undefined) {
          this.executionTimeMs.set(response.executionTimeMs);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Updates a column filter value in local state without triggering an immediate API query.
   * Query execution happens upon Enter key press or when focus/mouse leaves the input.
   * @param columnName Target property/column name.
   * @param value Filter query string.
   */
  public setFilterValue(columnName: string, value: string): void {
    this.columnFilters.update(current => {
      const updated = { ...current };
      if (value !== undefined && value !== null && value !== '') {
        updated[columnName] = value;
      } else {
        delete updated[columnName];
      }
      return updated;
    });
  }

  /**
   * Applies the current filter criteria and executes the API query (triggered by Enter key or on Blur/Mouse leave).
   * @param columnName Optional column name to set before applying.
   * @param value Optional value to set before applying.
   */
  public applyFilter(columnName?: string, value?: string): void {
    if (columnName !== undefined && value !== undefined) {
      this.setFilterValue(columnName, value);
    }
    this.currentPage.set(1);
    this.load();
  }

  /**
   * Clears a specific column filter or all filters and reloads the grid.
   * @param columnName Optional specific column to clear. If omitted, clears all filters.
   */
  public clearFilter(columnName?: string): void {
    if (columnName) {
      this.columnFilters.update(current => {
        const updated = { ...current };
        delete updated[columnName];
        return updated;
      });
    } else {
      this.columnFilters.set({});
    }
    this.currentPage.set(1);
    this.load();
  }

  /**
   * Updates any column filter value with automatic debounced execution.
   * @param columnName Target property/column name.
   * @param value Filter query string.
   */
  public updateFilter(columnName: string, value: string): void {
    this.columnFilters.update(current => {
      const updated = { ...current };
      if (value && value.trim()) {
        updated[columnName] = value.trim();
      } else {
        delete updated[columnName];
      }
      return updated;
    });

    this.currentPage.set(1);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.load();
    }, this.debounceMs);
  }

  /**
   * Toggles sorting on any specified column.
   * @param columnName Target property to sort by.
   */
  public toggleSort(columnName: string): void {
    if (this.sortColumn() === columnName) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(columnName);
      this.sortDirection.set('asc');
    }
    this.load();
  }

  /**
   * Returns the appropriate PrimeNG sort indicator icon CSS classes.
   * @param columnName Target column name.
   */
  public getSortIcon(columnName: string): string {
    if (this.sortColumn() !== columnName) return 'pi-sort-alt';
    return this.sortDirection() === 'asc'
      ? 'pi-sort-amount-up-alt text-cyan'
      : 'pi-sort-amount-down text-cyan';
  }

  /**
   * Navigates to the specified 1-based page number.
   * @param pageNum Page number.
   */
  public goToPage(pageNum: number | string): void {
    const page = typeof pageNum === 'string' ? parseInt(pageNum, 10) : pageNum;
    if (!isNaN(page) && page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.load();
    }
  }

  public prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.load();
    }
  }

  public nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.load();
    }
  }

  /**
   * Updates rows per page and re-executes query on page 1.
   * @param newSize New page size.
   */
  public onPageSizeChange(newSize: number | string): void {
    const size = Number(newSize) || 15;
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.load();
  }

  /**
   * Exports current dataset or items to CSV.
   * @param filename Base filename.
   * @param customColumns Optional custom column definitions.
   */
  public exportCsv(filename: string = 'DataGrid_Export', customColumns?: GridColumnDef<T>[]): void {
    const cols = customColumns || this.columns;
    exportGridToCsv(this.items(), cols, filename);
  }

  /**
   * Serializes current grid state into query parameters for API requests.
   */
  public getQueryParams(): GridQueryParams {
    const params: GridQueryParams = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      columnFilters: { ...this.columnFilters() }
    };

    if (this.searchTerm()) params.searchTerm = this.searchTerm();
    if (this.sortColumn()) {
      params.sortColumn = this.sortColumn();
      params.sortDirection = this.sortDirection();
    }

    const filters = this.columnFilters();
    for (const key of Object.keys(filters)) {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params[key] = filters[key];
      }
    }

    return params;
  }
}
