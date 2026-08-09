import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface MasterLabItem {
  code: string;
  name: string;
  discipline: string;
  lead: string;
  scope: string;
  status: string;
}

@Component({
  selector: 'app-master-lab-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './master-lab-list.component.html',
  styleUrl: './master-lab-list.component.css'
})
export class MasterLabListComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public labs = signal<MasterLabItem[]>([
    { code: 'LAB-PRES-01', name: 'Pressure & Vacuum Primary Lab', discipline: 'Pressure', lead: 'Dr. Marcus Vance', scope: '0 - 10,000 PSI (0.01% FS)', status: 'ACTIVE' },
    { code: 'LAB-TEMP-02', name: 'Thermal Standards Lab', discipline: 'Temperature', lead: 'Alex Rivera', scope: '-80°C to +1200°C', status: 'ACTIVE' },
    { code: 'LAB-ELEC-03', name: 'Electrical & RF Standards Lab', discipline: 'Electrical', lead: 'Sarah Jenkins', scope: 'DC/AC Voltage, Current, Resistance', status: 'ACTIVE' },
    { code: 'LAB-TORQ-04', name: 'Torque & Mechanical Lab', discipline: 'Torque', lead: 'Alex Rivera', scope: '0.1 Nm to 2000 Nm', status: 'ACTIVE' },
    { code: 'LAB-FLOW-05', name: 'Liquid & Gas Flow Lab', discipline: 'Flow', lead: 'Sarah Connor', scope: '0.01 to 100 m³/h', status: 'ACTIVE' },
    { code: 'LAB-MASS-06', name: 'Mass & Volume Lab', discipline: 'Mass', lead: 'Dr. Marcus Vance', scope: '1 mg to 500 kg (E2 Class)', status: 'ACTIVE' },
    { code: 'LAB-DIM-07', name: 'Dimensional & Metrology Lab', discipline: 'Dimensional', lead: 'Sarah Jenkins', scope: '0 to 1000 mm (Sub-micron)', status: 'ACTIVE' },
    { code: 'LAB-GAS-08', name: 'Gas Safety & Analytical Lab', discipline: 'Gas Safety', lead: 'Sarah Connor', scope: 'Multi-gas Mixtures & Sensors', status: 'ACTIVE' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    code: '', name: '', discipline: '', lead: '', scope: '', status: ''
  });

  public sortColumn = signal<string>('code');
  public sortDirection = signal<'asc' | 'desc'>('asc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.labs();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['code'] || item.code.toLowerCase().includes(f['code'].toLowerCase())) &&
        (!f['name'] || item.name.toLowerCase().includes(f['name'].toLowerCase())) &&
        (!f['discipline'] || item.discipline.toLowerCase().includes(f['discipline'].toLowerCase())) &&
        (!f['lead'] || item.lead.toLowerCase().includes(f['lead'].toLowerCase())) &&
        (!f['scope'] || item.scope.toLowerCase().includes(f['scope'].toLowerCase())) &&
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

  public newLab = { code: '', name: '', discipline: '', lead: '' };

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
    let csvContent = 'Lab Code,Laboratory Name,Discipline,Lead Metrologist,Accreditation Scope,Status\n';
    data.forEach(row => {
      csvContent += `"${row.code}","${row.name}","${row.discipline}","${row.lead}","${row.scope}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Master_Labs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveLab() {
    if (!this.newLab.name || !this.newLab.code) {
      this.toastService.showWarning('Required Field', 'Please enter Lab Code and Name.');
      return;
    }
    this.labs.update(list => [
      {
        code: this.newLab.code,
        name: this.newLab.name,
        discipline: this.newLab.discipline || 'General Metrology',
        lead: this.newLab.lead || 'Dr. Marcus Vance',
        scope: 'ISO 17025 Accredited Scope',
        status: 'ACTIVE'
      },
      ...list
    ]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Master Lab Saved', `Laboratory ${this.newLab.name} registered.`);
    this.newLab = { code: '', name: '', discipline: '', lead: '' };
  }
}
