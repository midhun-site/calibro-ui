import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ProcedureService, ProcedureItem, SaveProcedurePayload } from '../../services/procedure.service';
import { ApiService, Branch } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { DataGridState } from '../../common/grid';

/**
 * Component managing Quality Control calibration procedures and ISO/IEC 17025 SOP records.
 * Provides server-side paginated data grid, per-column filters, sorting, CSV export,
 * and complete CRUD via a 2-column compact edit modal.
 */
@Component({
  selector: 'app-procedures-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './procedures-list.component.html',
  styleUrl: './procedures-list.component.css'
})
export class ProceduresListComponent implements OnInit {
  private procedureService = inject(ProcedureService);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  public Math = Math;

  /** Universal reactive data grid state controller */
  public grid = new DataGridState<ProcedureItem>({
    defaultSortColumn: 'id',
    defaultSortDirection: 'desc',
    defaultPageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
    fetchFn: (params) => this.procedureService.getProcedures(params)
  });

  // Modal Dialog State
  public showModal = false;
  public isEditMode = false;
  public isSaving = signal<boolean>(false);

  // Active form data
  public formData: SaveProcedurePayload = {
    id: 0,
    lab: '',
    procedureType: '17025-EIAC',
    procedureNumber: '',
    calibrationProcedure: '',
    revision: '10',
    branchId: null,
    isActive: true
  };

  // Dropdown Lookups (loaded on demand)
  public branches = signal<Branch[]>([]);
  public labOptions: string[] = [
    'Dimensional Laboratory',
    'Thermal & Temperature Lab',
    'Pressure & Vacuum Lab',
    'Electrical Metrology Lab',
    'Mass & Weighing Lab',
    'Force, Torque & Hardness Lab',
    'Flow & Volume Metrology',
    'Optical & Photometry Lab',
    'Gas Safety & Detection Lab'
  ];

  public procedureTypeOptions: string[] = [
    '17025-EIAC',
    '17025-ENAS',
    '17025-NABL',
    '17025-DAkkS',
    '17025-UKAS',
    'ISO/IEC 17025 Standard',
    'Standard In-House SOP',
    'Manufacturer Standard'
  ];

  /**
   * Initializes the procedure list component and triggers initial server-side query.
   */
  ngOnInit(): void {
    this.grid.load();
    this.loadDropdownData();
  }

  /**
   * Loads branch lookup data for the modal form.
   */
  private loadDropdownData(): void {
    this.apiService.getBranches({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        if (res && res.items) {
          this.branches.set(res.items);
        }
      },
      error: (err) => {
        console.error('Failed to load branches for procedures modal:', err);
      }
    });
  }

  /**
   * Opens the modal dialog in Create mode.
   */
  public openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      id: 0,
      lab: this.labOptions[0],
      procedureType: '17025-EIAC',
      procedureNumber: '',
      calibrationProcedure: '',
      revision: '10',
      branchId: this.branches().length > 0 ? this.branches()[0].id : null,
      isActive: true
    };
    this.showModal = true;
  }

  /**
   * Opens the modal dialog in Edit mode populated with selected procedure row.
   * @param item The selected procedure item.
   */
  public openEditModal(item: ProcedureItem): void {
    this.isEditMode = true;
    this.formData = {
      id: item.id,
      lab: item.lab,
      procedureType: item.procedureType,
      procedureNumber: item.procedureNumber,
      calibrationProcedure: item.calibrationProcedure,
      revision: item.revision,
      branchId: item.branchId ?? null,
      isActive: item.isActive
    };
    this.showModal = true;
  }

  /**
   * Closes the edit/create modal dialog.
   */
  public closeModal(): void {
    this.showModal = false;
  }

  /**
   * Submits the procedure create/update form to the backend API.
   */
  public saveProcedure(): void {
    if (!this.formData.lab?.trim()) {
      this.toastService.showWarning('Validation Error', 'Please select a Laboratory.');
      return;
    }
    if (!this.formData.procedureNumber?.trim()) {
      this.toastService.showWarning('Validation Error', 'Please enter a Procedure Number.');
      return;
    }
    if (!this.formData.calibrationProcedure?.trim()) {
      this.toastService.showWarning('Validation Error', 'Please enter the Calibration Procedure title.');
      return;
    }
    if (!this.formData.revision?.trim()) {
      this.toastService.showWarning('Validation Error', 'Please enter the Revision.');
      return;
    }

    this.isSaving.set(true);

    this.procedureService.saveProcedure(this.formData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showModal = false;
        this.toastService.showSuccess(
          'Success',
          this.isEditMode
            ? `Procedure '${this.formData.procedureNumber}' updated successfully.`
            : `Procedure '${this.formData.procedureNumber}' created successfully.`
        );
        this.grid.load();
      },
      error: (err) => {
        this.isSaving.set(false);
        const detail = err.error?.detail || err.error?.title || err.message || 'Failed to save procedure.';
        this.toastService.showError('Save Error', detail);
      }
    });
  }

  /**
   * Prompts user and deletes a calibration procedure.
   * @param item The procedure row to delete.
   */
  public promptDelete(item: ProcedureItem): void {
    if (confirm(`Are you sure you want to delete procedure "${item.procedureNumber}" (${item.calibrationProcedure})?`)) {
      this.procedureService.deleteProcedure(item.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Deleted', `Procedure '${item.procedureNumber}' deleted.`);
          this.grid.load();
        },
        error: (err) => {
          const detail = err.error?.detail || err.error?.title || err.message || 'Failed to delete procedure.';
          this.toastService.showError('Delete Error', detail);
        }
      });
    }
  }

  /**
   * Exports the currently displayed or sorted dataset to a CSV spreadsheet file.
   */
  public exportCsv(): void {
    this.grid.exportCsv(`CaliBro_QC_Procedures_${new Date().toISOString().split('T')[0]}`, [
      { field: 'procedureNumber', header: 'Procedure Number' },
      { field: 'calibrationProcedure', header: 'Calibration Procedure' },
      { field: 'lab', header: 'Lab' },
      { field: 'procedureType', header: 'Procedure Type' },
      { field: 'revision', header: 'Revision' },
      { field: 'branchName', header: 'Branch' },
      { field: 'isActive', header: 'Status' }
    ]);
  }
}
