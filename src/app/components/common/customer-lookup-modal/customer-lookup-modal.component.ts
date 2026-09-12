import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerService } from '../../../services/customer.service';
import { DataGridState } from '../../../common/grid';
import type { Customer } from '../../../models/customer.model';

/**
 * Reusable modal dialog component providing server-side paginated, sorted,
 * and searchable customer lookup from the Customer Master repository.
 */
@Component({
  selector: 'app-customer-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './customer-lookup-modal.component.html',
  styleUrl: './customer-lookup-modal.component.css'
})
export class CustomerLookupModalComponent implements OnInit, OnChanges {
  private customerService = inject(CustomerService);
  protected Math = Math;

  /** Controls modal dialog visibility. */
  @Input() visible = false;

  /** Optional customer ID of currently selected customer to visually highlight. */
  @Input() selectedCustomerId: string | number | null = null;

  /** Emitted when a customer record is selected. */
  @Output() customerSelected = new EventEmitter<Customer>();

  /** Emitted when the modal is closed or cancelled. */
  @Output() close = new EventEmitter<void>();

  /** Temporary selection holding the highlighted customer in the grid. */
  public activeSelection = signal<Customer | null>(null);

  /** Server-side data grid state controller for customers. */
  public grid = new DataGridState<Customer>({
    defaultSortColumn: 'code',
    defaultSortDirection: 'asc',
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    columns: [
      { header: 'Customer ID', field: 'code' },
      { header: 'Company Name', field: 'companyName' },
      { header: 'Category', field: (c) => c.customerCategoryName || 'Standard' },
      { header: 'Contact Email', field: 'email' },
      { header: 'Phone', field: 'phone' },
      { header: 'City / Country', field: (c) => `${c.city || ''}, ${c.country || ''}` }
    ],
    fetchFn: (params) => this.customerService.getCustomers(params)
  });

  private searchDebounceTimer: any = null;

  ngOnInit(): void {
    if (this.visible) {
      this.grid.load();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.grid.load();
    }
  }

  /**
   * Handles user typing in the global search box with automatic debouncing.
   * @param query Search query text.
   */
  public onSearchInput(query: string): void {
    this.grid.searchTerm.set(query || '');
    this.grid.currentPage.set(1);

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.grid.load();
    }, 250);
  }

  /**
   * Clears all filters and global search.
   */
  public resetAllFilters(): void {
    this.grid.searchTerm.set('');
    this.grid.clearFilter();
  }

  /**
   * Selects a customer row into active selection buffer.
   * @param customer The clicked customer record.
   */
  public selectRow(customer: Customer): void {
    this.activeSelection.set(customer);
  }

  /**
   * Confirms selection and emits event to parent component.
   * @param customer Customer entity to emit.
   */
  public confirmSelection(customer?: Customer): void {
    const target = customer || this.activeSelection();
    if (target) {
      this.customerSelected.emit(target);
      this.closeModal();
    }
  }

  /**
   * Handles row double-click for immediate selection.
   * @param customer The double-clicked customer record.
   */
  public onRowDoubleClick(customer: Customer): void {
    this.confirmSelection(customer);
  }

  /**
   * Closes the lookup modal and clears temporary active selection.
   */
  public closeModal(): void {
    this.activeSelection.set(null);
    this.close.emit();
  }

  /**
   * Checks if a customer row is currently selected/highlighted.
   * @param item Customer to check.
   */
  public isRowSelected(item: Customer): boolean {
    const active = this.activeSelection();
    if (active && active.id === item.id) return true;
    if (!active && this.selectedCustomerId !== null && this.selectedCustomerId !== undefined) {
      return item.id.toString() === this.selectedCustomerId.toString();
    }
    return false;
  }
}
