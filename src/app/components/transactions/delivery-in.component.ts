import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface DeliveryInItem {
  dinNo: string;
  quoteRef: string;
  customer: string;
  count: number;
  condition: string;
  status: string;
}

@Component({
  selector: 'app-delivery-in',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './delivery-in.component.html',
  styleUrl: './delivery-in.component.css'
})
export class DeliveryInComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public deliveryIns = signal<DeliveryInItem[]>([
    { dinNo: 'DIN-2026-088', quoteRef: 'QT-2026-049', customer: 'AeroSpace Tech LLC', count: 5, condition: 'Good Condition (Sealed)', status: 'RECEIVED' },
    { dinNo: 'DIN-2026-089', quoteRef: 'QT-2026-050', customer: 'BioPharm Solutions', count: 12, condition: 'Minor Scratches', status: 'IN_LAB' },
    { dinNo: 'DIN-2026-090', quoteRef: 'QT-2026-052', customer: 'Global Energy Ltd', count: 8, condition: 'Pristine Condition', status: 'RECEIVED' },
    { dinNo: 'DIN-2026-091', quoteRef: 'QT-2026-053', customer: 'Emarat Aloula Contracting', count: 3, condition: 'Battery Low', status: 'IN_LAB' },
    { dinNo: 'DIN-2026-092', quoteRef: 'QT-2026-055', customer: 'Apex Medical Labs', count: 7, condition: 'Calibration Seal Intact', status: 'RECEIVED' },
    { dinNo: 'DIN-2026-093', quoteRef: 'QT-2026-057', customer: 'Al Futtaim Engineering', count: 4, condition: 'Clean / Unused', status: 'IN_LAB' },
    { dinNo: 'DIN-2026-094', quoteRef: 'QT-2026-058', customer: 'Emirates Steel Industries', count: 2, condition: 'Heavy Duty Cased', status: 'RECEIVED' },
    { dinNo: 'DIN-2026-095', quoteRef: 'QT-2026-056', customer: 'PetroChem Refineries', count: 15, condition: 'Oil Residue / Needs Clean', status: 'IN_LAB' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    dinNo: '', quoteRef: '', customer: '', count: '', condition: '', status: ''
  });

  public sortColumn = signal<string>('dinNo');
  public sortDirection = signal<'asc' | 'desc'>('desc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.deliveryIns();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['dinNo'] || item.dinNo.toLowerCase().includes(f['dinNo'].toLowerCase())) &&
        (!f['quoteRef'] || item.quoteRef.toLowerCase().includes(f['quoteRef'].toLowerCase())) &&
        (!f['customer'] || item.customer.toLowerCase().includes(f['customer'].toLowerCase())) &&
        (!f['count'] || item.count.toString().includes(f['count'])) &&
        (!f['condition'] || item.condition.toLowerCase().includes(f['condition'].toLowerCase())) &&
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

  public newDin = { quoteRef: '', customer: '', count: 1, condition: 'Good Condition' };

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
    let csvContent = 'DIN No,Quote Ref,Customer,Items Count,Condition,Status\n';
    data.forEach(row => {
      csvContent += `"${row.dinNo}","${row.quoteRef}","${row.customer}","${row.count}","${row.condition}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Delivery_In_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveDin() {
    if (!this.newDin.customer || !this.newDin.quoteRef) {
      this.toastService.showWarning('Required Field', 'Please enter Quote Ref and Customer Name.');
      return;
    }
    const newNo = `DIN-2026-0${this.deliveryIns().length + 88}`;
    this.deliveryIns.update(list => [
      {
        dinNo: newNo,
        quoteRef: this.newDin.quoteRef,
        customer: this.newDin.customer,
        count: this.newDin.count || 1,
        condition: this.newDin.condition || 'Good Condition',
        status: 'RECEIVED'
      },
      ...list
    ]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Equipment Received', `Delivery In ${newNo} logged for ${this.newDin.customer}.`);
    this.newDin = { quoteRef: '', customer: '', count: 1, condition: 'Good Condition' };
  }
}
