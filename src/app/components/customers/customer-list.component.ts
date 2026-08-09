import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models/customer.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Customer Directory</h2>
          <p class="subtitle">Manage Calibration Accounts & Site Locations</p>
        </div>
        <button class="btn-primary" (click)="showCreateModal = true">
          <i class="pi pi-plus"></i> Add New Customer
        </button>
      </div>

      <div class="glass-card table-card">
        <p-table [value]="customers()" [responsive]="true" [paginator]="true" [rows]="5" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Code</th>
              <th>Company Name</th>
              <th>Contact Email</th>
              <th>Phone</th>
              <th>City / Country</th>
              <th>Equipments</th>
              <th>Active Work Orders</th>
              <th>Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-cust>
            <tr>
              <td><span class="code-badge">{{ cust.code }}</span></td>
              <td><strong style="color: #fff;">{{ cust.companyName }}</strong></td>
              <td>{{ cust.email }}</td>
              <td>{{ cust.phone }}</td>
              <td>{{ cust.city }}, {{ cust.country }}</td>
              <td><span class="count-pill cyan">{{ cust.totalEquipments }}</span></td>
              <td><span class="count-pill blue">{{ cust.activeWorkOrders }}</span></td>
              <td>
                <button class="icon-btn"><i class="pi pi-eye"></i></button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center p-4">No customers registered yet. Click Add New Customer above.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Add Customer Dialog Modal -->
      <p-dialog header="Register New Customer Account" [(visible)]="showCreateModal" [modal]="true" [style]="{width: '500px'}">
        <div class="form-grid">
          <div class="form-group">
            <label>Customer Code</label>
            <input type="text" pInputText [(ngModel)]="newCust.code" placeholder="e.g. CUST-1003" />
          </div>
          <div class="form-group">
            <label>Company Name</label>
            <input type="text" pInputText [(ngModel)]="newCust.companyName" placeholder="e.g. Apex Precision Labs" />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" pInputText [(ngModel)]="newCust.email" placeholder="contact@apex.com" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" pInputText [(ngModel)]="newCust.phone" placeholder="+1 555-0199" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <input type="text" pInputText [(ngModel)]="newCust.address" placeholder="100 Tech Blvd" />
          </div>
          <div class="form-group">
            <label>City / Country</label>
            <input type="text" pInputText [(ngModel)]="newCust.city" placeholder="Austin, USA" />
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button pButton label="Cancel" class="p-button-text" (click)="showCreateModal = false"></button>
          <button pButton label="Save Customer" class="p-button-info" (click)="saveCustomer()"></button>
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
    .code-badge { background: rgba(0,242,254,0.1); color: var(--accent-cyan); padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 600; }
    .count-pill { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.82rem; font-weight: 700; }
    .count-pill.cyan { background: rgba(0,242,254,0.1); color: var(--accent-cyan); }
    .count-pill.blue { background: rgba(79,172,254,0.1); color: #4facfe; }
    .icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; }
    .icon-btn:hover { color: var(--accent-cyan); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 0; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.85rem; color: var(--text-muted); }
  `]
})
export class CustomerListComponent implements OnInit {
  private api = inject(ApiService);
  public customers = this.api.customers;
  public showCreateModal = false;

  public newCust = {
    code: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Houston',
    country: 'USA'
  };

  ngOnInit() {
    this.api.getCustomers().subscribe();
  }

  saveCustomer() {
    this.api.createCustomer(this.newCust).subscribe(() => {
      this.showCreateModal = false;
    });
  }
}
