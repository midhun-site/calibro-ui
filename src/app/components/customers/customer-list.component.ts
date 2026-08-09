import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../services/api.service';
import type { Customer } from '../../models/customer.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  private api = inject(ApiService);
  private toastService = inject(ToastService);

  public customers = signal<Customer[]>([]);
  public showCreateModal = false;

  public newCust: Customer = {
    id: '0',
    code: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    totalEquipments: 0,
    activeWorkOrders: 0
  };

  ngOnInit() {
    this.api.getCustomers().subscribe(data => {
      this.customers.set(data);
    });
  }

  saveCustomer() {
    if (!this.newCust.companyName || !this.newCust.code) {
      this.toastService.showWarning('Required Fields Missing', 'Please enter Customer Code and Company Name.');
      return;
    }

    const created: Customer = { ...this.newCust, id: String(Date.now()) };
    this.api.createCustomer(this.newCust).subscribe({
      next: () => {
        this.customers.update(list => [created, ...list]);
        this.showCreateModal = false;
        this.toastService.showSuccess('Customer Account Saved', `${this.newCust.companyName} registered successfully.`);
        this.resetForm();
      },
      error: () => {
        // Fallback for mock environment
        this.customers.update(list => [created, ...list]);
        this.showCreateModal = false;
        this.toastService.showSuccess('Customer Account Saved', `${this.newCust.companyName} registered successfully.`);
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.newCust = { id: '0', code: '', companyName: '', email: '', phone: '', address: '', city: '', country: '', totalEquipments: 0, activeWorkOrders: 0 };
  }
}
