import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface EnquiryRow {
  enquiryNo: string;
  customer: string;
  receivedDate: string;
  instrumentsCount: string;
  serviceType: string;
  status: string;
}

@Component({
  selector: 'app-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './enquiry.component.html',
  styleUrl: './enquiry.component.css'
})
export class EnquiryComponent {
  private router = inject(Router);
  private toastService = inject(ToastService);
  protected Math = Math;
  public showCreateModal = false;

  public rawData = signal<EnquiryRow[]>([
    { enquiryNo: 'ENQ-2026-081', customer: 'EMARAT ALOULA CONTRACTING CO', receivedDate: '2026-08-09', instrumentsCount: '3 Items (Gas Detectors)', serviceType: 'Calibration (CAL)', status: 'OPEN' },
    { enquiryNo: 'ENQ-2026-082', customer: 'AeroSpace Tech LLC', receivedDate: '2026-08-08', instrumentsCount: '5 Instruments', serviceType: 'In-House Lab', status: 'QUOTED' },
    { enquiryNo: 'ENQ-2026-083', customer: 'BioPharm Solutions', receivedDate: '2026-08-07', instrumentsCount: '12 Instruments', serviceType: 'On-Site Calibration', status: 'APPROVED' },
    { enquiryNo: 'ENQ-2026-084', customer: 'Global Energy Ltd', receivedDate: '2026-08-06', instrumentsCount: '8 Instruments', serviceType: 'Calibration (CAL)', status: 'OPEN' },
    { enquiryNo: 'ENQ-2026-085', customer: 'Precision Eng Co', receivedDate: '2026-08-05', instrumentsCount: '2 Gauges', serviceType: 'In-House Lab', status: 'QUOTED' },
    { enquiryNo: 'ENQ-2026-086', customer: 'National Petroleum Corp', receivedDate: '2026-08-04', instrumentsCount: '15 Transmitters', serviceType: 'On-Site Calibration', status: 'APPROVED' },
    { enquiryNo: 'ENQ-2026-087', customer: 'Gulf Marine Systems', receivedDate: '2026-08-03', instrumentsCount: '4 Meters', serviceType: 'Calibration (CAL)', status: 'OPEN' },
    { enquiryNo: 'ENQ-2026-088', customer: 'Apex Heavy Industries', receivedDate: '2026-08-02', instrumentsCount: '6 Calibrators', serviceType: 'In-House Lab', status: 'QUOTED' },
    { enquiryNo: 'ENQ-2026-089', customer: 'Delta Oilfield Services', receivedDate: '2026-08-01', instrumentsCount: '10 Valves', serviceType: 'On-Site Calibration', status: 'APPROVED' },
    { enquiryNo: 'ENQ-2026-090', customer: 'Emirates Steel Arkan', receivedDate: '2026-07-31', instrumentsCount: '7 Scales', serviceType: 'Calibration (CAL)', status: 'OPEN' },
    { enquiryNo: 'ENQ-2026-091', customer: 'Al Jaber Engineering', receivedDate: '2026-07-30', instrumentsCount: '9 Probes', serviceType: 'In-House Lab', status: 'QUOTED' },
    { enquiryNo: 'ENQ-2026-092', customer: 'Target Engineering Const', receivedDate: '2026-07-29', instrumentsCount: '14 Gauges', serviceType: 'On-Site Calibration', status: 'APPROVED' },
    { enquiryNo: 'ENQ-2026-093', customer: 'NMDC Energy PJSC', receivedDate: '2026-07-28', instrumentsCount: '11 Sensors', serviceType: 'Calibration (CAL)', status: 'OPEN' },
    { enquiryNo: 'ENQ-2026-094', customer: 'Borouge Petrochemicals', receivedDate: '2026-07-27', instrumentsCount: '18 Analyzers', serviceType: 'In-House Lab', status: 'QUOTED' },
    { enquiryNo: 'ENQ-2026-095', customer: 'TAQA Energy UAE', receivedDate: '2026-07-26', instrumentsCount: '5 Meters', serviceType: 'On-Site Calibration', status: 'APPROVED' }
  ]);

  // Column Filters
  public filters = signal<{ [key: string]: string }>({
    enquiryNo: '',
    customer: '',
    receivedDate: '',
    instrumentsCount: '',
    serviceType: '',
    status: ''
  });

  // Sorting State
  public sortColumn = signal<keyof EnquiryRow>('enquiryNo');
  public sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination State
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  // Computed Filtered & Sorted Records
  public filteredData = computed(() => {
    const list = this.rawData();
    const currentFilters = this.filters();

    return list.filter(row => {
      return Object.keys(currentFilters).every(key => {
        const query = currentFilters[key]?.toLowerCase() || '';
        if (!query) return true;
        const val = String((row as any)[key] || '').toLowerCase();
        return val.includes(query);
      });
    });
  });

  public sortedData = computed(() => {
    const list = [...this.filteredData()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      const valA = String(a[col] || '').toLowerCase();
      const valB = String(b[col] || '').toLowerCase();
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // Paginated Data Chunk
  public paginatedData = computed(() => {
    const list = this.sortedData();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  public totalPages = computed(() => Math.ceil(this.sortedData().length / this.pageSize()) || 1);

  // Computed Numbered Page Buttons Array (1, 2, 3... 100)
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

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  updateFilter(column: string, value: string) {
    this.filters.update(prev => ({ ...prev, [column]: value }));
    this.currentPage.set(1);
  }

  toggleSort(column: keyof EnquiryRow) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: keyof EnquiryRow): string {
    if (this.sortColumn() !== column) return 'pi-sort-alt';
    return this.sortDirection() === 'asc' ? 'pi-sort-amount-up-alt text-cyan' : 'pi-sort-amount-down text-cyan';
  }

  goToPage(pageNum: number) {
    if (pageNum >= 1 && pageNum <= this.totalPages()) {
      this.currentPage.set(pageNum);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  exportToCsv() {
    const data = this.sortedData();
    if (!data || data.length === 0) {
      this.toastService.showWarning('No Data', 'There is no data to export.');
      return;
    }

    const headers = ['Enquiry No', 'Customer', 'Received Date', 'Instruments Count', 'Service Type', 'Status'];
    const rows = data.map(item => [
      item.enquiryNo,
      `"${item.customer.replace(/"/g, '""')}"`,
      item.receivedDate,
      `"${item.instrumentsCount.replace(/"/g, '""')}"`,
      `"${item.serviceType.replace(/"/g, '""')}"`,
      item.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} enquiry records to CSV.`);
  }

  createNewEnquiryPage() {
    this.router.navigate(['/transactions/enquiry/add']);
  }
}
