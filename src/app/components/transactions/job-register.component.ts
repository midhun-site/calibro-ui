import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface WorkOrderItem {
  woNo: string;
  customer: string;
  assetTag: string;
  instrument: string;
  assignedTech: string;
  dueDate: string;
  status: string;
}

@Component({
  selector: 'app-job-register',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './job-register.component.html',
  styleUrl: './job-register.component.css'
})
export class JobRegisterComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public workorders = signal<WorkOrderItem[]>([
    { woNo: 'WO-2026-001', customer: 'EMARAT ALOULA CONTRACTING CO', assetTag: 'EQ-TEMP-002', instrument: 'Precision Temp Calibrator', assignedTech: 'Alex Rivera', dueDate: '2026-08-15', status: 'IN_PROGRESS' },
    { woNo: 'WO-2026-002', customer: 'AeroSpace Tech LLC', assetTag: 'EQ-PRESS-005', instrument: 'Digital Pressure Gauge (10K PSI)', assignedTech: 'Sarah Connor', dueDate: '2026-08-14', status: 'CALIBRATED' },
    { woNo: 'WO-2026-003', customer: 'BioPharm Solutions', assetTag: 'EQ-TORQ-012', instrument: 'Digital Torque Wrench (1000 Nm)', assignedTech: 'Alex Rivera', dueDate: '2026-08-18', status: 'PENDING' },
    { woNo: 'WO-2026-004', customer: 'Global Energy Ltd', assetTag: 'EQ-ELEC-018', instrument: 'Fluke 87V Industrial Multimeter', assignedTech: 'Marcus Vance', dueDate: '2026-08-12', status: 'CALIBRATED' },
    { woNo: 'WO-2026-005', customer: 'Precision Eng Co', assetTag: 'EQ-FLOW-009', instrument: 'Ultrasonic Flowmeter Rig', assignedTech: 'Sarah Connor', dueDate: '2026-08-20', status: 'IN_PROGRESS' },
    { woNo: 'WO-2026-006', customer: 'Gulf Marine Services', assetTag: 'EQ-MASS-003', instrument: 'Analytical Balance (0.01mg)', assignedTech: 'Alex Rivera', dueDate: '2026-08-11', status: 'CALIBRATED' },
    { woNo: 'WO-2026-007', customer: 'Apex Medical Labs', assetTag: 'EQ-DIM-014', instrument: 'Vernier Height Gauge (600mm)', assignedTech: 'Marcus Vance', dueDate: '2026-08-22', status: 'PENDING' },
    { woNo: 'WO-2026-008', customer: 'PetroChem Refineries', assetTag: 'EQ-GAS-022', instrument: '4-Gas Personal Monitor', assignedTech: 'Sarah Connor', dueDate: '2026-08-10', status: 'OVERDUE' },
    { woNo: 'WO-2026-009', customer: 'Al Futtaim Engineering', assetTag: 'EQ-OPT-031', instrument: 'Optical Laser Tachometer', assignedTech: 'Alex Rivera', dueDate: '2026-08-16', status: 'CALIBRATED' },
    { woNo: 'WO-2026-010', customer: 'Emirates Steel Industries', assetTag: 'EQ-LOAD-007', instrument: 'Heavy Duty Load Cell (100 Ton)', assignedTech: 'Marcus Vance', dueDate: '2026-08-25', status: 'IN_PROGRESS' },
    { woNo: 'WO-2026-011', customer: 'Dubai Electricity & Water', assetTag: 'EQ-VOLT-044', instrument: 'High Voltage Probe (40kV)', assignedTech: 'Alex Rivera', dueDate: '2026-08-19', status: 'PENDING' },
    { woNo: 'WO-2026-012', customer: 'Abu Dhabi National Oil Co', assetTag: 'EQ-DEAD-001', instrument: 'Hydraulic Deadweight Tester', assignedTech: 'Sarah Connor', dueDate: '2026-08-13', status: 'CALIBRATED' },
    { woNo: 'WO-2026-013', customer: 'Sharjah Oxygen Company', assetTag: 'EQ-GAS-029', instrument: 'Oxygen Cleanliness Gauge', assignedTech: 'Marcus Vance', dueDate: '2026-08-24', status: 'IN_PROGRESS' },
    { woNo: 'WO-2026-014', customer: 'Ras Al Khaimah Ceramics', assetTag: 'EQ-TEMP-088', instrument: 'Type S Thermocouple Calibrator', assignedTech: 'Alex Rivera', dueDate: '2026-08-17', status: 'CALIBRATED' },
    { woNo: 'WO-2026-015', customer: 'Fujairah Port Authority', assetTag: 'EQ-DENS-005', instrument: 'Digital Hydrometer / Density Meter', assignedTech: 'Sarah Connor', dueDate: '2026-08-26', status: 'PENDING' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    woNo: '', customer: '', assetTag: '', instrument: '', assignedTech: '', dueDate: '', status: ''
  });

  public sortColumn = signal<string>('woNo');
  public sortDirection = signal<'asc' | 'desc'>('desc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.workorders();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['woNo'] || item.woNo.toLowerCase().includes(f['woNo'].toLowerCase())) &&
        (!f['customer'] || item.customer.toLowerCase().includes(f['customer'].toLowerCase())) &&
        (!f['assetTag'] || item.assetTag.toLowerCase().includes(f['assetTag'].toLowerCase())) &&
        (!f['instrument'] || item.instrument.toLowerCase().includes(f['instrument'].toLowerCase())) &&
        (!f['assignedTech'] || item.assignedTech.toLowerCase().includes(f['assignedTech'].toLowerCase())) &&
        (!f['dueDate'] || item.dueDate.toLowerCase().includes(f['dueDate'].toLowerCase())) &&
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

  public newJob = { woRef: '', assetTag: '', instrument: '', tech: '' };

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
    let csvContent = 'Work Order No,Customer,Asset Tag,Instrument Description,Assigned Tech,Due Date,Status\n';
    data.forEach(row => {
      csvContent += `"${row.woNo}","${row.customer}","${row.assetTag}","${row.instrument}","${row.assignedTech}","${row.dueDate}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_WorkOrders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveJob() {
    if (!this.newJob.woRef || !this.newJob.assetTag) {
      this.toastService.showWarning('Required Field', 'Please enter Work Order Ref and Asset Tag.');
      return;
    }
    const newNo = `WO-2026-0${this.workorders().length + 16}`;
    this.workorders.update(list => [
      {
        woNo: newNo,
        customer: 'AeroSpace Tech LLC',
        assetTag: this.newJob.assetTag,
        instrument: this.newJob.instrument || 'Precision Calibration Instrument',
        assignedTech: this.newJob.tech || 'Alex Rivera',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'IN_PROGRESS'
      },
      ...list
    ]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Work Order Created', `Work order ${newNo} logged successfully.`);
    this.newJob = { woRef: '', assetTag: '', instrument: '', tech: '' };
  }
}
