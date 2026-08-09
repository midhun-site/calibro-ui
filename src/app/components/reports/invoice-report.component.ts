import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface InvoiceItem {
  invoiceNo: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  taxAmount: string;
  totalAmount: string;
  status: string;
}

@Component({
  selector: 'app-invoice-report',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './invoice-report.component.html',
  styleUrl: './invoice-report.component.css'
})
export class InvoiceReportComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public invoices = signal<InvoiceItem[]>([
    { invoiceNo: 'INV-2026-0042', customer: 'AeroSpace Tech LLC', issueDate: '2026-08-08', dueDate: '2026-09-07', taxAmount: '$22.50', totalAmount: '$472.50', status: 'PAID' },
    { invoiceNo: 'INV-2026-0043', customer: 'BioPharm Solutions', issueDate: '2026-08-07', dueDate: '2026-09-06', taxAmount: '$620.00', totalAmount: '$13,020.00', status: 'PAID' },
    { invoiceNo: 'INV-2026-0044', customer: 'Global Energy Ltd', issueDate: '2026-08-06', dueDate: '2026-09-05', taxAmount: '$437.50', totalAmount: '$9,187.50', status: 'PENDING' },
    { invoiceNo: 'INV-2026-0045', customer: 'Precision Eng Co', issueDate: '2026-08-05', dueDate: '2026-09-04', taxAmount: '$105.00', totalAmount: '$2,205.00', status: 'PAID' },
    { invoiceNo: 'INV-2026-0046', customer: 'Emarat Aloula Contracting', issueDate: '2026-08-04', dueDate: '2026-09-03', taxAmount: '$170.00', totalAmount: '$3,570.00', status: 'PENDING' },
    { invoiceNo: 'INV-2026-0047', customer: 'Gulf Marine Services', issueDate: '2026-08-03', dueDate: '2026-09-02', taxAmount: '$312.50', totalAmount: '$6,562.50', status: 'PAID' },
    { invoiceNo: 'INV-2026-0048', customer: 'Apex Medical Labs', issueDate: '2026-08-02', dueDate: '2026-09-01', taxAmount: '$97.50', totalAmount: '$2,047.50', status: 'PAID' },
    { invoiceNo: 'INV-2026-0049', customer: 'PetroChem Refineries', issueDate: '2026-08-01', dueDate: '2026-08-31', taxAmount: '$790.00', totalAmount: '$16,590.00', status: 'OVERDUE' },
    { invoiceNo: 'INV-2026-0050', customer: 'Al Futtaim Engineering', issueDate: '2026-07-30', dueDate: '2026-08-29', taxAmount: '$206.00', totalAmount: '$4,326.00', status: 'PAID' },
    { invoiceNo: 'INV-2026-0051', customer: 'Emirates Steel Industries', issueDate: '2026-07-28', dueDate: '2026-08-27', taxAmount: '$465.00', totalAmount: '$9,765.00', status: 'PAID' },
    { invoiceNo: 'INV-2026-0052', customer: 'Dubai Electricity & Water', issueDate: '2026-07-25', dueDate: '2026-08-24', taxAmount: '$540.00', totalAmount: '$11,340.00', status: 'PENDING' },
    { invoiceNo: 'INV-2026-0053', customer: 'Abu Dhabi National Oil Co', issueDate: '2026-07-22', dueDate: '2026-08-21', taxAmount: '$890.00', totalAmount: '$18,690.00', status: 'PAID' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    invoiceNo: '', customer: '', issueDate: '', dueDate: '', taxAmount: '', totalAmount: '', status: ''
  });

  public sortColumn = signal<string>('invoiceNo');
  public sortDirection = signal<'asc' | 'desc'>('desc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.invoices();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['invoiceNo'] || item.invoiceNo.toLowerCase().includes(f['invoiceNo'].toLowerCase())) &&
        (!f['customer'] || item.customer.toLowerCase().includes(f['customer'].toLowerCase())) &&
        (!f['issueDate'] || item.issueDate.toLowerCase().includes(f['issueDate'].toLowerCase())) &&
        (!f['dueDate'] || item.dueDate.toLowerCase().includes(f['dueDate'].toLowerCase())) &&
        (!f['taxAmount'] || item.taxAmount.toLowerCase().includes(f['taxAmount'].toLowerCase())) &&
        (!f['totalAmount'] || item.totalAmount.toLowerCase().includes(f['totalAmount'].toLowerCase())) &&
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

  public newInvoice = { customerName: '', amount: 0, tax: 5 };

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
    let csvContent = 'Invoice No,Customer,Issue Date,Due Date,Tax Amount,Total Amount,Status\n';
    data.forEach(row => {
      csvContent += `"${row.invoiceNo}","${row.customer}","${row.issueDate}","${row.dueDate}","${row.taxAmount}","${row.totalAmount}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveInvoice() {
    if (!this.newInvoice.customerName) {
      this.toastService.showWarning('Required Field', 'Please enter Customer Name.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const newNo = `INV-2026-0${this.invoices().length + 42}`;
    const subtotal = this.newInvoice.amount || 2500;
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    this.invoices.update(list => [
      {
        invoiceNo: newNo,
        customer: this.newInvoice.customerName,
        issueDate: today,
        dueDate: dueDate,
        taxAmount: `$${tax.toFixed(2)}`,
        totalAmount: `$${total.toFixed(2)}`,
        status: 'PENDING'
      },
      ...list
    ]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Invoice Generated', `Invoice ${newNo} generated successfully.`);
    this.newInvoice = { customerName: '', amount: 0, tax: 5 };
  }
}
