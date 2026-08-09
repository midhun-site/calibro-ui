import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface DeliveryTicketItem {
  dtNo: string;
  woRef: string;
  customer: string;
  certNo: string;
  courier: string;
  status: string;
}

@Component({
  selector: 'app-delivery-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './delivery-ticket.component.html',
  styleUrl: './delivery-ticket.component.css'
})
export class DeliveryTicketComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public deliveryTickets = signal<DeliveryTicketItem[]>([
    { dtNo: 'DT-2026-077', woRef: 'WO-2026-001', customer: 'AeroSpace Tech LLC', certNo: 'CERT-2026-8891', courier: 'DHL Express (TRK: 99401)', status: 'DISPATCHED' },
    { dtNo: 'DT-2026-078', woRef: 'WO-2026-002', customer: 'BioPharm Solutions', certNo: 'CERT-2026-8892', courier: 'FedEx Priority', status: 'DELIVERED' },
    { dtNo: 'DT-2026-079', woRef: 'WO-2026-004', customer: 'Global Energy Ltd', certNo: 'CERT-2026-8894', courier: 'Aramex Express', status: 'DISPATCHED' },
    { dtNo: 'DT-2026-080', woRef: 'WO-2026-006', customer: 'Precision Eng Co', certNo: 'CERT-2026-8896', courier: 'Customer Driver Hand Delivery', status: 'DELIVERED' },
    { dtNo: 'DT-2026-081', woRef: 'WO-2026-008', customer: 'Emarat Aloula Contracting', certNo: 'CERT-2026-8898', courier: 'DHL Express', status: 'DISPATCHED' },
    { dtNo: 'DT-2026-082', woRef: 'WO-2026-009', customer: 'Apex Medical Labs', certNo: 'CERT-2026-8899', courier: 'FedEx Priority', status: 'DELIVERED' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    dtNo: '', woRef: '', customer: '', certNo: '', courier: '', status: ''
  });

  public sortColumn = signal<string>('dtNo');
  public sortDirection = signal<'asc' | 'desc'>('desc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.deliveryTickets();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['dtNo'] || item.dtNo.toLowerCase().includes(f['dtNo'].toLowerCase())) &&
        (!f['woRef'] || item.woRef.toLowerCase().includes(f['woRef'].toLowerCase())) &&
        (!f['customer'] || item.customer.toLowerCase().includes(f['customer'].toLowerCase())) &&
        (!f['certNo'] || item.certNo.toLowerCase().includes(f['certNo'].toLowerCase())) &&
        (!f['courier'] || item.courier.toLowerCase().includes(f['courier'].toLowerCase())) &&
        (!f['status'] || item.status.toLowerCase().includes(f['status'].toLowerCase()))
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

  public newDt = { woRef: '', customer: '', certNo: '', courier: '' };

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
    let csvContent = 'Delivery Ticket No,WO Ref,Customer,Cert No,Courier,Status\n';
    data.forEach(row => {
      csvContent += `"${row.dtNo}","${row.woRef}","${row.customer}","${row.certNo}","${row.courier}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Delivery_Tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveDt() {
    if (!this.newDt.customer || !this.newDt.woRef) {
      this.toastService.showWarning('Required Field', 'Please enter Work Order Ref and Customer Name.');
      return;
    }
    const newNo = `DT-2026-0${this.deliveryTickets().length + 77}`;
    this.deliveryTickets.update(list => [
      {
        dtNo: newNo,
        woRef: this.newDt.woRef,
        customer: this.newDt.customer,
        certNo: this.newDt.certNo || 'CERT-2026-9000',
        courier: this.newDt.courier || 'DHL Express Hand Delivery',
        status: 'DISPATCHED'
      },
      ...list
    ]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Delivery Ticket Created', `Dispatch ticket ${newNo} generated for ${this.newDt.customer}.`);
    this.newDt = { woRef: '', customer: '', certNo: '', courier: '' };
  }
}
