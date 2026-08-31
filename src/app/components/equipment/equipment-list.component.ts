import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ItemService } from '../../services/item.service';
import { LookupService } from '../../services/lookup.service';
import { ToastService } from '../../services/toast.service';
import { DataGridState } from '../../common/grid';
import type { Item, SaveItemPayload } from '../../models/item.model';
import type { LookupItem } from '../../models/lookup.model';

/**
 * Item Master (Stock Item) Component managing laboratory master instruments,
 * spare parts, tools, server-side data grid, per-column filtering, sorting,
 * numbered pagination, CSV export, and creation/editing modals with dirty state confirmation.
 */
@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './equipment-list.component.html',
  styleUrl: './equipment-list.component.css'
})
export class EquipmentListComponent implements OnInit {
  private itemService = inject(ItemService);
  private lookupService = inject(LookupService);
  private toastService = inject(ToastService);
  protected Math = Math;

  // ── Database-Backed Server-Side DataGridState ───────────────────────────
  public itemGrid = new DataGridState<Item>({
    defaultSortColumn: 'itemCode',
    defaultSortDirection: 'asc',
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    columns: [
      { header: 'Item Code', field: 'itemCode' },
      { header: 'Item Name', field: 'itemName' },
      { header: 'Model No', field: 'modelNo' },
      { header: 'Units', field: 'unit' },
      { header: 'Supplier', field: 'supplier' },
      { header: 'Remarks', field: 'remarks' },
      { header: 'Status', field: (i) => i.isActive ? 'ACTIVE' : 'INACTIVE' }
    ],
    fetchFn: (params) => this.itemService.getItems(params)
  });

  // Dynamic Units of measurement from Database Lookups API
  public unitOfMeasures = this.lookupService.unitOfMeasures;

  // Supplier reference list
  public supplierOptions = signal<string[]>([
    'SNAP-ON TOOLS INTERNATIONAL',
    'Fluke Calibration',
    'WIKA Instruments',
    'Mitutoyo Corporation',
    'Mettler Toledo',
    'Fuji Electric',
    'BW Honeywell',
    'Sturtevant Richmont'
  ]);

  // Modal State
  public showModal = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public showDeleteModal = signal<boolean>(false);
  public targetItem = signal<Item | null>(null);
  public isSaving = signal<boolean>(false);

  // Validation & Dirty State Tracking
  public formSubmitted = signal<boolean>(false);
  public touchedFields = signal<{ [key: string]: boolean }>({});
  public showUnsavedConfirmModal = signal<boolean>(false);
  private initialFormSnapshot: string = '';

  // Form Model State
  public formItem = signal<SaveItemPayload>({
    id: null,
    itemCode: '',
    itemName: '',
    modelNo: '',
    unit: 'No',
    supplier: 'SNAP-ON TOOLS INTERNATIONAL',
    remarks: '',
    isActive: true
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.itemGrid.load();
  }

  // ── Dirty State & Confirmation Dialog ────────────────────────────────────
  /**
   * Captures snapshot of active form data to detect unsaved changes.
   */
  private captureInitialSnapshot(): void {
    this.initialFormSnapshot = JSON.stringify(this.formItem());
  }

  /**
   * Checks whether form data has been altered.
   */
  public isFormDirty(): boolean {
    if (!this.initialFormSnapshot) return false;
    return this.initialFormSnapshot !== JSON.stringify(this.formItem());
  }

  /**
   * Intercepts modal close to prompt confirmation if unsaved changes exist.
   */
  public requestCloseModal(): void {
    if (this.isFormDirty()) {
      this.showUnsavedConfirmModal.set(true);
    } else {
      this.forceCloseModal();
    }
  }

  /**
   * Discards changes and closes modal.
   */
  public discardAndClose(): void {
    this.showUnsavedConfirmModal.set(false);
    this.forceCloseModal();
  }

  /**
   * Dismisses unsaved confirmation dialog to continue editing.
   */
  public keepEditing(): void {
    this.showUnsavedConfirmModal.set(false);
  }

  /**
   * Resets form state and closes modal.
   */
  private forceCloseModal(): void {
    this.showModal.set(false);
    this.formSubmitted.set(false);
    this.touchedFields.set({});
    this.initialFormSnapshot = '';
  }

  // ── Validation Helpers ───────────────────────────────────────────────────
  public markFieldTouched(fieldName: string): void {
    this.touchedFields.update(t => ({ ...t, [fieldName]: true }));
  }

  public isFieldInvalid(fieldName: string): boolean {
    const isTouched = this.touchedFields()[fieldName] || this.formSubmitted();
    if (!isTouched) return false;

    const form = this.formItem();
    switch (fieldName) {
      case 'itemName':
        return !form.itemName || !form.itemName.trim();
      default:
        return false;
    }
  }

  public getFieldError(fieldName: string): string {
    const form = this.formItem();
    switch (fieldName) {
      case 'itemName':
        return (!form.itemName || !form.itemName.trim()) ? 'Item Name is required.' : '';
      default:
        return '';
    }
  }

  // ── CRUD Handlers ────────────────────────────────────────────────────────
  /**
   * Opens modal to create a new stock item.
   */
  public openAddModal(): void {
    this.isEditMode.set(false);
    this.formSubmitted.set(false);
    this.touchedFields.set({});

    this.formItem.set({
      id: null,
      itemCode: '',
      itemName: '',
      modelNo: '',
      unit: 'No',
      supplier: 'SNAP-ON TOOLS INTERNATIONAL',
      remarks: '',
      isActive: true
    });

    this.captureInitialSnapshot();

    // Lazy load Units of Measure from Lookup API
    this.lookupService.ensureUnitOfMeasuresLoaded(units => {
      if (units && units.length > 0 && !this.formItem().unit) {
        this.formItem.update(f => ({ ...f, unit: units[0].name }));
        this.captureInitialSnapshot();
      }
    });

    // Fetch next sequential code from API
    this.itemService.getNextItemCode().subscribe({
      next: res => {
        if (res && res.itemCode) {
          this.formItem.update(f => ({ ...f, itemCode: res.itemCode }));
          this.captureInitialSnapshot();
        }
      },
      error: () => {}
    });

    this.showModal.set(true);
  }

  /**
   * Opens modal to edit an existing stock item.
   */
  public openEditModal(item: Item): void {
    this.isEditMode.set(true);
    this.formSubmitted.set(false);
    this.touchedFields.set({});
    this.targetItem.set(item);

    this.formItem.set({
      id: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      modelNo: item.modelNo || '',
      unit: item.unit || 'No',
      supplier: item.supplier || 'SNAP-ON TOOLS INTERNATIONAL',
      remarks: item.remarks || '',
      isActive: item.isActive
    });

    this.captureInitialSnapshot();

    // Lazy load Units of Measure from Lookup API
    this.lookupService.ensureUnitOfMeasuresLoaded();

    this.showModal.set(true);
  }

  /**
   * Persists new or modified item to PostgreSQL database.
   */
  public saveItem(): void {
    this.formSubmitted.set(true);

    if (this.isFieldInvalid('itemName')) {
      this.toastService.showWarning('Validation Required', 'Please provide an Item Name.');
      return;
    }

    const payload = this.formItem();
    this.isSaving.set(true);

    this.itemService.saveItem(payload).subscribe({
      next: res => {
        this.isSaving.set(false);
        this.forceCloseModal();
        this.toastService.showSuccess(
          this.isEditMode() ? 'Stock Item Updated' : 'Stock Item Created',
          res.message || `${payload.itemName} saved successfully.`
        );
        this.itemGrid.load();
      },
      error: err => {
        this.isSaving.set(false);
        const msg = err.error?.detail || err.error?.message || err.message || 'Failed to save stock item.';
        this.toastService.showError('Save Failed', msg);
      }
    });
  }

  /**
   * Prompts delete confirmation modal.
   */
  public promptDelete(item: Item): void {
    this.targetItem.set(item);
    this.showDeleteModal.set(true);
  }

  /**
   * Executes soft-delete on the target item.
   */
  public executeDelete(): void {
    const item = this.targetItem();
    if (!item) return;

    this.isSaving.set(true);
    this.itemService.deleteItem(item.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showDeleteModal.set(false);
        this.toastService.showSuccess('Stock Item Deleted', `${item.itemName} removed.`);
        this.itemGrid.load();
      },
      error: err => {
        this.isSaving.set(false);
        const msg = err.error?.detail || err.error?.message || 'Failed to delete stock item.';
        this.toastService.showError('Delete Failed', msg);
      }
    });
  }
}
