import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../services/api.service';
import type { Customer } from '../../models/customer.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  private api = inject(ApiService);
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public initialCustomers: Customer[] = [
    { id: '1', code: 'CUST-1001', companyName: 'EMARAT ALOULA CONTRACTING CO', email: 'info@emarat-aloula.ae', phone: '+971 4 881 2233', address: 'Plot 598, Jebel Ali Ind 1', city: 'Dubai', country: 'United Arab Emirates', totalEquipments: 14, activeWorkOrders: 3 },
    { id: '2', code: 'CUST-1002', companyName: 'AeroSpace Tech LLC', email: 'calibration@aerospacetech.com', phone: '+971 2 550 4499', address: 'Mussafah Ind Area M-14', city: 'Abu Dhabi', country: 'United Arab Emirates', totalEquipments: 28, activeWorkOrders: 5 },
    { id: '3', code: 'CUST-1003', companyName: 'BioPharm Solutions', email: 'qa@biopharm.org', phone: '+971 6 743 1122', address: 'Hamriyah Free Zone', city: 'Sharjah', country: 'United Arab Emirates', totalEquipments: 42, activeWorkOrders: 8 },
    { id: '4', code: 'CUST-1004', companyName: 'Global Energy Ltd', email: 'support@globalenergy.com', phone: '+971 4 332 8877', address: 'Al Quoz Ind Area 4', city: 'Dubai', country: 'United Arab Emirates', totalEquipments: 19, activeWorkOrders: 2 },
    { id: '5', code: 'CUST-1005', companyName: 'Precision Eng Co', email: 'lab@precision-eng.ae', phone: '+971 3 762 9900', address: 'Al Ain Ind Area', city: 'Al Ain', country: 'United Arab Emirates', totalEquipments: 11, activeWorkOrders: 1 },
    { id: '6', code: 'CUST-1006', companyName: 'Gulf Marine Services', email: 'metrology@gulfmarine.com', phone: '+971 2 678 3344', address: 'Mina Zayed Port', city: 'Abu Dhabi', country: 'United Arab Emirates', totalEquipments: 35, activeWorkOrders: 6 },
    { id: '7', code: 'CUST-1007', companyName: 'Apex Medical Labs', email: 'compliance@apexmed.ae', phone: '+971 4 299 5566', address: 'Dubai Healthcare City', city: 'Dubai', country: 'United Arab Emirates', totalEquipments: 22, activeWorkOrders: 4 },
    { id: '8', code: 'CUST-1008', companyName: 'PetroChem Refineries', email: 'inst.dept@petrochem.com', phone: '+971 2 810 1100', address: 'Ruwais Ind Complex', city: 'Ruwais', country: 'United Arab Emirates', totalEquipments: 65, activeWorkOrders: 12 },
    { id: '9', code: 'CUST-1009', companyName: 'Al Futtaim Engineering', email: 'lab.services@alfuttaim.ae', phone: '+971 4 213 7700', address: 'Airport Road', city: 'Dubai', country: 'United Arab Emirates', totalEquipments: 18, activeWorkOrders: 3 },
    { id: '10', code: 'CUST-1010', companyName: 'Emirates Steel Industries', email: 'qa.calibration@emiratessteel.ae', phone: '+971 2 507 2200', address: 'ICAD I', city: 'Abu Dhabi', country: 'United Arab Emirates', totalEquipments: 50, activeWorkOrders: 9 }
  ];

  public customers = signal<Customer[]>(this.initialCustomers);

  public filters = signal<{ [key: string]: string }>({
    code: '', companyName: '', email: '', phone: '', city: '', totalEquipments: '', activeWorkOrders: ''
  });

  public sortColumn = signal<string>('code');
  public sortDirection = signal<'asc' | 'desc'>('asc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.customers();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['code'] || item.code.toLowerCase().includes(f['code'].toLowerCase())) &&
        (!f['companyName'] || item.companyName.toLowerCase().includes(f['companyName'].toLowerCase())) &&
        (!f['email'] || item.email.toLowerCase().includes(f['email'].toLowerCase())) &&
        (!f['phone'] || item.phone.toLowerCase().includes(f['phone'].toLowerCase())) &&
        (!f['city'] || (item.city + ' ' + item.country).toLowerCase().includes(f['city'].toLowerCase())) &&
        (!f['totalEquipments'] || item.totalEquipments.toString().includes(f['totalEquipments'])) &&
        (!f['activeWorkOrders'] || item.activeWorkOrders.toString().includes(f['activeWorkOrders']))
      );
    });
  });

  public sortedData = computed(() => {
    const data = [...this.filteredData()];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    return data.sort((a, b) => {
      const valA = (a as any)[col] ?? '';
      const valB = (b as any)[col] ?? '';
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  public totalPages = computed(() => Math.ceil(this.sortedData().length / this.pageSize()) || 1);

  public paginatedData = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.sortedData().slice(start, start + size);
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
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  public newCust: Customer = {
    id: '0', code: '', companyName: '', email: '', phone: '', address: '', city: '', country: '', totalEquipments: 0, activeWorkOrders: 0
  };

  ngOnInit() {
    this.api.getCustomers().subscribe({
      next: data => {
        if (data && data.length > 0) this.customers.set(data);
      },
      error: () => {}
    });
  }

  updateFilter(col: string, val: string) {
    this.filters.update(f => ({ ...f, [col]: val }));
    this.currentPage.set(1);
  }

  toggleSort(col: string) {
    if (this.sortColumn() === col) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(col: string): string {
    if (this.sortColumn() !== col) return 'pi-sort-alt';
    return this.sortDirection() === 'asc' ? 'pi-sort-amount-up-alt text-cyan' : 'pi-sort-amount-down text-cyan';
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  exportToCsv() {
    const data = this.sortedData();
    if (data.length === 0) {
      this.toastService.showWarning('Export Error', 'No data available to export.');
      return;
    }
    let csvContent = 'Customer Code,Company Name,Email,Phone,City,Country,Total Equipments,Active Work Orders\n';
    data.forEach(row => {
      csvContent += `"${row.code}","${row.companyName}","${row.email}","${row.phone}","${row.city}","${row.country}","${row.totalEquipments}","${row.activeWorkOrders}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Customer_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveCustomer() {
    if (!this.newCust.companyName || !this.newCust.code) {
      this.toastService.showWarning('Required Fields Missing', 'Please enter Customer Code and Company Name.');
      return;
    }

    const created: Customer = { ...this.newCust, id: String(Date.now()) };
    this.customers.update(list => [created, ...list]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Customer Account Saved', `${this.newCust.companyName} registered successfully.`);
    this.resetForm();
  }

  resetForm() {
    this.newCust = { id: '0', code: '', companyName: '', email: '', phone: '', address: '', city: '', country: '', totalEquipments: 0, activeWorkOrders: 0 };
  }
}
