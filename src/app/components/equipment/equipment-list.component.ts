import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CustomerEquipment, EquipmentStatus } from '../../models/equipment.model';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, DialogModule, InputTextModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Equipment & Asset Registry</h2>
          <p class="subtitle">ISO/IEC 17025 Traceable Instruments & Recall Schedules</p>
        </div>
        <button class="btn-primary" (click)="showCreateModal = true">
          <i class="pi pi-plus"></i> Register New Equipment
        </button>
      </div>

      <div class="glass-card table-card">
        <p-table [value]="equipments()" [responsive]="true" [paginator]="true" [rows]="6" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Asset Tag</th>
              <th>Instrument Name</th>
              <th>Category</th>
              <th>Manufacturer & Model</th>
              <th>Serial No.</th>
              <th>Accuracy / Range</th>
              <th>Next Calibration Due</th>
              <th>Status</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-eq>
            <tr>
              <td><span class="tag-badge">{{ eq.assetTag }}</span></td>
              <td><strong style="color:#fff;">{{ eq.name }}</strong></td>
              <td><span class="category-chip">{{ eq.category }}</span></td>
              <td>{{ eq.manufacturer }} ({{ eq.model }})</td>
              <td><code>{{ eq.serialNumber }}</code></td>
              <td><small class="text-muted">{{ eq.accuracySpec }} | {{ eq.measurementRange }}</small></td>
              <td>
                <div class="due-cell" [class.overdue]="eq.isOverdue">
                  <i class="pi" [class.pi-calendar]="!eq.isOverdue" [class.pi-exclamation-circle]="eq.isOverdue"></i>
                  <span>{{ eq.nextDueDate ? (eq.nextDueDate | date:'mediumDate') : 'N/A' }}</span>
                </div>
              </td>
              <td>
                <p-tag [value]="eq.isOverdue ? 'OVERDUE' : 'ACTIVE'" [severity]="eq.isOverdue ? 'danger' : 'success'"></p-tag>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Add Equipment Dialog -->
      <p-dialog header="Register Calibration Instrument" [(visible)]="showCreateModal" [modal]="true" [style]="{width: '550px'}">
        <div class="form-grid">
          <div class="form-group">
            <label>Asset Tag</label>
            <input type="text" pInputText [(ngModel)]="newEq.assetTag" placeholder="e.g. EQ-PRES-009" />
          </div>
          <div class="form-group">
            <label>Instrument Name</label>
            <input type="text" pInputText [(ngModel)]="newEq.name" placeholder="e.g. Torque Wrench 0-100 Nm" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" pInputText [(ngModel)]="newEq.category" placeholder="Pressure / Temp / Torque" />
          </div>
          <div class="form-group">
            <label>Manufacturer</label>
            <input type="text" pInputText [(ngModel)]="newEq.manufacturer" placeholder="Fluke / Mitutoyo" />
          </div>
          <div class="form-group">
            <label>Model</label>
            <input type="text" pInputText [(ngModel)]="newEq.model" placeholder="Model 2000" />
          </div>
          <div class="form-group">
            <label>Serial Number</label>
            <input type="text" pInputText [(ngModel)]="newEq.serialNumber" placeholder="SN-998811" />
          </div>
          <div class="form-group">
            <label>Accuracy Spec</label>
            <input type="text" pInputText [(ngModel)]="newEq.accuracySpec" placeholder="±0.05% FS" />
          </div>
          <div class="form-group">
            <label>Measurement Range</label>
            <input type="text" pInputText [(ngModel)]="newEq.measurementRange" placeholder="0 - 1000 PSI" />
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button pButton label="Cancel" class="p-button-text" (click)="showCreateModal = false"></button>
          <button pButton label="Save Instrument" class="p-button-info" (click)="saveEquipment()"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .subtitle { color: var(--text-muted); }
    .btn-primary {
      background: var(--accent-gradient); border: none; color: #000; font-weight: 700;
      padding: 0.75rem 1.25rem; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
    }
    .table-card { padding: 1rem; }
    .tag-badge { background: rgba(79, 172, 254, 0.15); color: #4facfe; padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 600; }
    .category-chip { background: rgba(255, 255, 255, 0.05); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; }
    .due-cell { display: flex; align-items: center; gap: 0.4rem; color: #10b981; }
    .due-cell.overdue { color: #ef4444; font-weight: 700; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 0; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.85rem; color: var(--text-muted); }
  `]
})
export class EquipmentListComponent implements OnInit {
  private api = inject(ApiService);
  public equipments = this.api.equipments;
  public showCreateModal = false;

  public newEq = {
    customerId: '00000000-0000-0000-0000-000000000000',
    assetTag: '',
    name: '',
    category: 'Pressure',
    manufacturer: '',
    model: '',
    serialNumber: '',
    location: 'Lab Room 101',
    accuracySpec: '±0.05%',
    measurementRange: '0 - 100 PSI',
    calibrationIntervalMonths: 12
  };

  ngOnInit() {
    this.api.getEquipments().subscribe();
  }

  saveEquipment() {
    // If customers exist, assign first customer id
    const currentCusts = this.api.customers();
    if (currentCusts.length > 0) {
      this.newEq.customerId = currentCusts[0].id;
    }

    this.api.createEquipment(this.newEq).subscribe(() => {
      this.showCreateModal = false;
    });
  }
}
