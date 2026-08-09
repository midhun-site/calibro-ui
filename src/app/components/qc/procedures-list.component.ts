import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface ProcedureItem {
  docNo: string;
  title: string;
  discipline: string;
  standardRef: string;
  revNo: string;
  status: string;
}

@Component({
  selector: 'app-procedures-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './procedures-list.component.html',
  styleUrl: './procedures-list.component.css'
})
export class ProceduresListComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public procedures = signal<ProcedureItem[]>([
    { docNo: 'SOP-CAL-P01', title: 'Calibration of Dial & Digital Pressure Gauges', discipline: 'Pressure', standardRef: 'DKD-R 6-1 / BS EN 837-1', revNo: 'Rev 4.0', status: 'ACTIVE' },
    { docNo: 'SOP-CAL-T02', title: 'Calibration of Dry-Well Temp Calibrators & PRTs', discipline: 'Temperature', standardRef: 'EURAMET cg-13 / ITS-90', revNo: 'Rev 3.2', status: 'ACTIVE' },
    { docNo: 'SOP-CAL-E03', title: 'Multimeter & Voltage Source Verification Procedure', discipline: 'Electrical', standardRef: 'EURAMET cg-15', revNo: 'Rev 5.0', status: 'ACTIVE' },
    { docNo: 'SOP-CAL-M04', title: 'Calibration of Torque Tools & Transducers', discipline: 'Torque', standardRef: 'ISO 6789-2:2017', revNo: 'Rev 2.1', status: 'ACTIVE' },
    { docNo: 'SOP-CAL-F05', title: 'Ultrasonic & Electromagnetic Flowmeter In-Situ Test', discipline: 'Flow', standardRef: 'ISO 4185 / OIML R49', revNo: 'Rev 1.5', status: 'ACTIVE' },
    { docNo: 'SOP-CAL-W06', title: 'Calibration of Non-Automatic Weighing Instruments', discipline: 'Mass', standardRef: 'EURAMET cg-18 v4.0', revNo: 'Rev 6.0', status: 'ACTIVE' },
    { docNo: 'SOP-CAL-D07', title: 'Calibration of Micrometers, Calipers & Gauges', discipline: 'Dimensional', standardRef: 'DIN 862 / ISO 13385', revNo: 'Rev 3.0', status: 'ACTIVE' },
    { docNo: 'SOP-CAL-G08', title: 'Bump Test & Span Calibration of Portable Gas Detectors', discipline: 'Gas Safety', standardRef: 'IEC 60079-29-2', revNo: 'Rev 4.1', status: 'ACTIVE' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    docNo: '', title: '', discipline: '', standardRef: '', revNo: '', status: ''
  });

  public sortColumn = signal<string>('docNo');
  public sortDirection = signal<'asc' | 'desc'>('asc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.procedures();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['docNo'] || item.docNo.toLowerCase().includes(f['docNo'].toLowerCase())) &&
        (!f['title'] || item.title.toLowerCase().includes(f['title'].toLowerCase())) &&
        (!f['discipline'] || item.discipline.toLowerCase().includes(f['discipline'].toLowerCase())) &&
        (!f['standardRef'] || item.standardRef.toLowerCase().includes(f['standardRef'].toLowerCase())) &&
        (!f['revNo'] || item.revNo.toLowerCase().includes(f['revNo'].toLowerCase())) &&
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

  public newProc = { docNo: '', title: '', discipline: '', standardRef: '' };

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
    let csvContent = 'SOP Doc No,Procedure Title,Discipline,Standard Reference,Rev No,Status\n';
    data.forEach(row => {
      csvContent += `"${row.docNo}","${row.title}","${row.discipline}","${row.standardRef}","${row.revNo}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_SOP_Procedures_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveProc() {
    if (!this.newProc.title || !this.newProc.docNo) {
      this.toastService.showWarning('Required Field', 'Please enter SOP Number and Title.');
      return;
    }
    this.procedures.update(list => [
      {
        docNo: this.newProc.docNo,
        title: this.newProc.title,
        discipline: this.newProc.discipline || 'General Metrology',
        standardRef: this.newProc.standardRef || 'ISO/IEC 17025 Standard',
        revNo: 'Rev 1.0',
        status: 'ACTIVE'
      },
      ...list
    ]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Procedure Saved', `SOP ${this.newProc.docNo} registered.`);
    this.newProc = { docNo: '', title: '', discipline: '', standardRef: '' };
  }
}
