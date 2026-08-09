import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface CalibrationReportItem {
  certNo: string;
  assetTag: string;
  instrument: string;
  customer: string;
  calDate: string;
  nextDueDate: string;
  result: string;
}

@Component({
  selector: 'app-calibration-report',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './calibration-report.component.html',
  styleUrl: './calibration-report.component.css'
})
export class CalibrationReportComponent {
  private toastService = inject(ToastService);
  public Math = Math;

  public reports = signal<CalibrationReportItem[]>([
    { certNo: 'CERT-2026-8891', assetTag: 'EQ-TEMP-002', instrument: 'Precision Temp Calibrator', customer: 'AeroSpace Tech LLC', calDate: '2026-08-08', nextDueDate: '2027-08-08', result: 'PASSED' },
    { certNo: 'CERT-2026-8892', assetTag: 'EQ-PRESS-005', instrument: 'Digital Pressure Gauge (10K PSI)', customer: 'BioPharm Solutions', calDate: '2026-08-07', nextDueDate: '2027-08-07', result: 'PASSED' },
    { certNo: 'CERT-2026-8893', assetTag: 'EQ-TORQ-012', instrument: 'Digital Torque Wrench (1000 Nm)', customer: 'Global Energy Ltd', calDate: '2026-08-06', nextDueDate: '2027-02-06', result: 'ADJUSTED' },
    { certNo: 'CERT-2026-8894', assetTag: 'EQ-ELEC-018', instrument: 'Fluke 87V Industrial Multimeter', customer: 'Precision Eng Co', calDate: '2026-08-05', nextDueDate: '2027-08-05', result: 'PASSED' },
    { certNo: 'CERT-2026-8895', assetTag: 'EQ-FLOW-009', instrument: 'Ultrasonic Flowmeter Rig', customer: 'Emarat Aloula Contracting', calDate: '2026-08-04', nextDueDate: '2027-08-04', result: 'PASSED' },
    { certNo: 'CERT-2026-8896', assetTag: 'EQ-MASS-003', instrument: 'Analytical Balance (0.01mg)', customer: 'Gulf Marine Services', calDate: '2026-08-03', nextDueDate: '2027-02-03', result: 'PASSED' },
    { certNo: 'CERT-2026-8897', assetTag: 'EQ-DIM-014', instrument: 'Vernier Height Gauge (600mm)', customer: 'Apex Medical Labs', calDate: '2026-08-02', nextDueDate: '2027-08-02', result: 'PASSED' },
    { certNo: 'CERT-2026-8898', assetTag: 'EQ-GAS-022', instrument: '4-Gas Personal Monitor', customer: 'PetroChem Refineries', calDate: '2026-08-01', nextDueDate: '2027-02-01', result: 'FAILED' },
    { certNo: 'CERT-2026-8899', assetTag: 'EQ-OPT-031', instrument: 'Optical Laser Tachometer', customer: 'Al Futtaim Engineering', calDate: '2026-07-30', nextDueDate: '2027-07-30', result: 'PASSED' },
    { certNo: 'CERT-2026-0900', assetTag: 'EQ-LOAD-007', instrument: 'Heavy Duty Load Cell (100 Ton)', customer: 'Emirates Steel Industries', calDate: '2026-07-28', nextDueDate: '2027-07-28', result: 'PASSED' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    certNo: '', assetTag: '', instrument: '', customer: '', calDate: '', nextDueDate: '', result: ''
  });

  public sortColumn = signal<string>('certNo');
  public sortDirection = signal<'asc' | 'desc'>('desc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.reports();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['certNo'] || item.certNo.toLowerCase().includes(f['certNo'].toLowerCase())) &&
        (!f['assetTag'] || item.assetTag.toLowerCase().includes(f['assetTag'].toLowerCase())) &&
        (!f['instrument'] || item.instrument.toLowerCase().includes(f['instrument'].toLowerCase())) &&
        (!f['customer'] || item.customer.toLowerCase().includes(f['customer'].toLowerCase())) &&
        (!f['calDate'] || item.calDate.toLowerCase().includes(f['calDate'].toLowerCase())) &&
        (!f['nextDueDate'] || item.nextDueDate.toLowerCase().includes(f['nextDueDate'].toLowerCase())) &&
        (!f['result'] || item.result.toLowerCase().includes(f['result'].toLowerCase()))
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
    let csvContent = 'Certificate No,Asset Tag,Instrument,Customer,Cal Date,Next Due Date,Result\n';
    data.forEach(row => {
      csvContent += `"${row.certNo}","${row.assetTag}","${row.instrument}","${row.customer}","${row.calDate}","${row.nextDueDate}","${row.result}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Calibration_Certificates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }
}
