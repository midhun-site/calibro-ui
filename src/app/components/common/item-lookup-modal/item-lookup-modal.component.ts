import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ItemService } from '../../../services/item.service';
import { DataGridState } from '../../../common/grid';
import type { Item } from '../../../models/item.model';

export interface SelectedItemPayload {
  item: Item;
  qty: number;
}

/**
 * Reusable modal dialog component providing server-side paginated, sorted,
 * and searchable item selection with multi-select checkboxes and quantity inputs.
 */
@Component({
  selector: 'app-item-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './item-lookup-modal.component.html',
  styleUrl: './item-lookup-modal.component.css'
})
export class ItemLookupModalComponent implements OnInit, OnChanges {
  private itemService = inject(ItemService);
  protected Math = Math;

  /** Controls modal visibility. */
  @Input() visible = false;

  /** Emitted when the user confirms selection of multiple items. */
  @Output() itemsSelected = new EventEmitter<SelectedItemPayload[]>();

  /** Emitted when the modal is closed or dismissed. */
  @Output() close = new EventEmitter<void>();

  /** Map of row quantities for all items in the grid, keyed by item ID. */
  public rowQuantities = signal<Map<number, number>>(new Map());

  /** Map of selected items keyed by item ID, storing item object and chosen quantity. */
  public selectedMap = signal<Map<number, SelectedItemPayload>>(new Map());

  /** Total count of selected items. */
  public selectedCount = computed(() => this.selectedMap().size);

  /** Server-side data grid state controller for items. */
  public grid = new DataGridState<Item>({
    defaultSortColumn: 'itemCode',
    defaultSortDirection: 'asc',
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    columns: [
      { header: 'Item Code', field: 'itemCode' },
      { header: 'Item Name', field: 'itemName' },
      { header: 'Model No', field: 'modelNo' },
      { header: 'Unit', field: 'unit' },
      { header: 'Make / Supplier', field: 'supplier' },
      { header: 'Remarks', field: 'remarks' }
    ],
    fetchFn: (params) => this.itemService.getItems(params)
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
   * Handles user typing in the global search box with debouncing.
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
   * Checks whether an item is currently selected in the map.
   * @param item The item record to check.
   */
  public isItemSelected(item: Item): boolean {
    return this.selectedMap().has(item.id);
  }

  /**
   * Retrieves the quantity configured for a given item (default 1).
   * @param item The item record.
   */
  public getItemQty(item: Item): number {
    return this.rowQuantities().get(item.id) ?? 1;
  }

  /**
   * Updates the quantity for an item and synchronizes with selected map if selected.
   * @param item The item record.
   * @param qtyValue New quantity input value.
   */
  public setItemQty(item: Item, qtyValue: any): void {
    const qty = Math.max(1, parseInt(qtyValue, 10) || 1);
    this.rowQuantities.update(map => {
      const newMap = new Map(map);
      newMap.set(item.id, qty);
      return newMap;
    });

    this.selectedMap.update(map => {
      const newMap = new Map(map);
      if (newMap.has(item.id)) {
        newMap.set(item.id, { item, qty });
      }
      return newMap;
    });
  }

  /**
   * Toggles item checkbox selection using the item's configured quantity.
   * @param item The item record.
   */
  public toggleItemSelection(item: Item): void {
    const qty = this.getItemQty(item);
    this.selectedMap.update(map => {
      const newMap = new Map(map);
      if (newMap.has(item.id)) {
        newMap.delete(item.id);
      } else {
        newMap.set(item.id, { item, qty });
      }
      return newMap;
    });
  }

  /**
   * Toggles select all items on the current visible grid page.
   */
  public toggleSelectAllCurrentPage(): void {
    const pageItems = this.grid.items();
    if (pageItems.length === 0) return;

    const allPageSelected = pageItems.every(i => this.isItemSelected(i));

    this.selectedMap.update(map => {
      const newMap = new Map(map);
      if (allPageSelected) {
        for (const i of pageItems) {
          newMap.delete(i.id);
        }
      } else {
        for (const i of pageItems) {
          const qty = this.getItemQty(i);
          newMap.set(i.id, { item: i, qty });
        }
      }
      return newMap;
    });
  }

  /**
   * Determines if all items on the current page are selected.
   */
  public isAllCurrentPageSelected(): boolean {
    const pageItems = this.grid.items();
    if (pageItems.length === 0) return false;
    return pageItems.every(i => this.isItemSelected(i));
  }

  /**
   * Confirms selection and emits all selected items with quantities.
   */
  public confirmSelection(): void {
    const list = Array.from(this.selectedMap().values());
    if (list.length > 0) {
      this.itemsSelected.emit(list);
      this.closeModal();
    }
  }

  /**
   * Closes the lookup modal and resets selected items and quantities.
   */
  public closeModal(): void {
    this.selectedMap.set(new Map());
    this.rowQuantities.set(new Map());
    this.close.emit();
  }
}
