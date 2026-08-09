import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface QuotationItem {
  quoteNo: string;
  customer: string;
  quoteDate: string;
  totalAmount: string;
  validUntil: string;
  status: string;
}

@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './quotation.component.html',
  styleUrl: './quotation.component.css'
})
export class QuotationComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public quotations = signal<QuotationItem[]>([
    { quoteNo: 'QT-2026-049', customer: 'AeroSpace Tech LLC', quoteDate: '2026-08-09', totalAmount: '$4,850.00', validUntil: '2026-09-09', status: 'SENT' },
    { quoteNo: 'QT-2026-050', customer: 'BioPharm Solutions', quoteDate: '2026-08-08', totalAmount: '$12,400.00', validUntil: '2026-09-08', status: 'APPROVED' },
    { quoteNo: 'QT-2026-051', customer: 'Precision Eng Co', quoteDate: '2026-08-07', totalAmount: '$2,100.00', validUntil: '2026-09-07', status: 'PENDING' },
    { quoteNo: 'QT-2026-052', customer: 'Global Energy Ltd', quoteDate: '2026-08-06', totalAmount: '$8,750.00', validUntil: '2026-09-06', status: 'APPROVED' },
    { quoteNo: 'QT-2026-053', customer: 'Emarat Aloula Contracting', quoteDate: '2026-08-05', totalAmount: '$3,400.00', validUntil: '2026-09-05', status: 'SENT' },
    { quoteNo: 'QT-2026-054', customer: 'Gulf Marine Services', quoteDate: '2026-08-04', totalAmount: '$6,250.00', validUntil: '2026-09-04', status: 'REJECTED' },
    { quoteNo: 'QT-2026-055', customer: 'Apex Medical Labs', quoteDate: '2026-08-03', totalAmount: '$1,950.00', validUntil: '2026-09-03', status: 'APPROVED' },
    { quoteNo: 'QT-2026-056', customer: 'PetroChem Refineries', quoteDate: '2026-08-02', totalAmount: '$15,800.00', validUntil: '2026-09-02', status: 'SENT' },
    { quoteNo: 'QT-2026-057', customer: 'Al Futtaim Engineering', quoteDate: '2026-08-01', totalAmount: '$4,120.00', validUntil: '2026-09-01', status: 'APPROVED' },
    { quoteNo: 'QT-2026-058', customer: 'Emirates Steel Industries', quoteDate: '2026-07-31', totalAmount: '$9,300.00', validUntil: '2026-08-31', status: 'APPROVED' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    quoteNo: '', customer: '', quoteDate: '', totalAmount: '', validUntil: '', status: ''
  });

  public sortColumn = signal<string>('quoteNo');
  public sortDirection = signal<'asc' | 'desc'>('desc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.quotations();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['quoteNo'] || item.quoteNo.toLowerCase().includes(f['quoteNo'].toLowerCase())) &&
        (!f['customer'] || item.customer.toLowerCase().includes(f['customer'].toLowerCase())) &&
        (!f['quoteDate'] || item.quoteDate.toLowerCase().includes(f['quoteDate'].toLowerCase())) &&
        (!f['totalAmount'] || item.totalAmount.toLowerCase().includes(f['totalAmount'].toLowerCase())) &&
        (!f['validUntil'] || item.validUntil.toLowerCase().includes(f['validUntil'].toLowerCase())) &&
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

  public newQuote = { customerName: '', validityDays: 30, totalValue: 0, remarks: '' };

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
    let csvContent = 'Quotation No,Customer,Quote Date,Total Amount,Valid Until,Status\n';
    data.forEach(row => {
      csvContent += `"${row.quoteNo}","${row.customer}","${row.quoteDate}","${row.totalAmount}","${row.validUntil}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Quotations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveQuotation() {
    if (!this.newQuote.customerName) {
      this.toastService.showWarning('Required Field', 'Please enter Customer Name for the quotation.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const validDate = new Date(Date.now() + (this.newQuote.validityDays || 30) * 86400000).toISOString().split('T')[0];
    const newNo = `QT-2026-0${this.quotations().length + 49}`;

    this.quotations.update(list => [
      {
        quoteNo: newNo,
        customer: this.newQuote.customerName,
        quoteDate: today,
        totalAmount: `$${(this.newQuote.totalValue || 1500).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        validUntil: validDate,
        status: 'SENT'
      },
      ...list
    ]);

    this.showCreateModal = false;
    this.toastService.showSuccess('Quotation Created', `Proposal ${newNo} saved successfully.`);
    this.newQuote = { customerName: '', validityDays: 30, totalValue: 0, remarks: '' };
  }
}
