import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../services/api.service';
import { CustomerEquipment, EquipmentStatus } from '../../models/equipment.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './equipment-list.component.html',
  styleUrl: './equipment-list.component.css'
})
export class EquipmentListComponent implements OnInit {
  private api = inject(ApiService);
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public initialMockEquipments: CustomerEquipment[] = [
    { id: '1', customerId: '1', customerName: 'EMARAT ALOULA CONTRACTING CO', assetTag: 'EQ-TEMP-002', name: 'Precision Temp Calibrator', serialNumber: 'SN-994012', category: 'Temperature', manufacturer: 'Fluke Calibration', model: 'Model-9142', location: 'Lab A - Dry Well', accuracySpec: '±0.05°C', measurementRange: '-25 to 660°C', calibrationIntervalMonths: 12, status: EquipmentStatus.Active, isOverdue: true },
    { id: '2', customerId: '2', customerName: 'AeroSpace Tech LLC', assetTag: 'EQ-PRESS-005', name: 'Digital Pressure Gauge', serialNumber: 'SN-884100', category: 'Pressure', manufacturer: 'WIKA', model: 'CPG1500', location: 'Bench 3', accuracySpec: '0.025% FS', measurementRange: '0 to 10,000 PSI', calibrationIntervalMonths: 12, status: EquipmentStatus.Active, isOverdue: false },
    { id: '3', customerId: '3', customerName: 'BioPharm Solutions', assetTag: 'EQ-TORQ-012', name: 'Digital Torque Wrench', serialNumber: 'SN-774911', category: 'Torque', manufacturer: 'Sturtevant Richmont', model: 'System4', location: 'Lab B', accuracySpec: '±1%', measurementRange: '10 to 1000 Nm', calibrationIntervalMonths: 6, status: EquipmentStatus.Active, isOverdue: false },
    { id: '4', customerId: '4', customerName: 'Global Energy Ltd', assetTag: 'EQ-ELEC-018', name: 'Fluke 87V Industrial Multimeter', serialNumber: 'SN-665022', category: 'Electrical', manufacturer: 'Fluke', model: '87V', location: 'Mobile Bench', accuracySpec: '0.05%', measurementRange: '0 to 1000V AC/DC', calibrationIntervalMonths: 12, status: EquipmentStatus.Active, isOverdue: false },
    { id: '5', customerId: '5', customerName: 'Precision Eng Co', assetTag: 'EQ-FLOW-009', name: 'Ultrasonic Flowmeter', serialNumber: 'SN-554109', category: 'Flow', manufacturer: 'Fuji Electric', model: 'FSC-2', location: 'Flow Rig', accuracySpec: '±0.5%', measurementRange: '0.1 to 30 m/s', calibrationIntervalMonths: 12, status: EquipmentStatus.Active, isOverdue: false },
    { id: '6', customerId: '6', customerName: 'Gulf Marine Services', assetTag: 'EQ-MASS-003', name: 'Analytical Balance (0.01mg)', serialNumber: 'SN-443180', category: 'Mass', manufacturer: 'Mettler Toledo', model: 'XPR205', location: 'Balance Room', accuracySpec: '0.01 mg', measurementRange: '0 to 220g', calibrationIntervalMonths: 6, status: EquipmentStatus.Active, isOverdue: false },
    { id: '7', customerId: '7', customerName: 'Apex Medical Labs', assetTag: 'EQ-DIM-014', name: 'Vernier Height Gauge (600mm)', serialNumber: 'SN-332901', category: 'Dimensional', manufacturer: 'Mitutoyo', model: '570-312', location: 'Inspection Room', accuracySpec: '±0.03mm', measurementRange: '0 to 600mm', calibrationIntervalMonths: 12, status: EquipmentStatus.Active, isOverdue: false },
    { id: '8', customerId: '8', customerName: 'PetroChem Refineries', assetTag: 'EQ-GAS-022', name: '4-Gas Personal Monitor', serialNumber: 'SN-221094', category: 'Gas Safety', manufacturer: 'BW Honeywell', model: 'MicroClip XL', location: 'Safety Lab', accuracySpec: '±2% FS', measurementRange: 'O2, H2S, CO, LEL', calibrationIntervalMonths: 6, status: EquipmentStatus.InCalibration, isOverdue: false }
  ];

  public equipments = signal<CustomerEquipment[]>(this.initialMockEquipments);

  public filters = signal<{ [key: string]: string }>({
    assetTag: '', name: '', customerName: '', category: '', makeModel: '', serialNumber: '', interval: '', status: ''
  });

  public sortColumn = signal<string>('assetTag');
  public sortDirection = signal<'asc' | 'desc'>('asc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.equipments();
    const f = this.filters();
    return data.filter(item => {
      const makeModel = `${item.manufacturer} ${item.model}`.toLowerCase();
      return (
        (!f['assetTag'] || item.assetTag.toLowerCase().includes(f['assetTag'].toLowerCase())) &&
        (!f['name'] || item.name.toLowerCase().includes(f['name'].toLowerCase())) &&
        (!f['customerName'] || item.customerName.toLowerCase().includes(f['customerName'].toLowerCase())) &&
        (!f['category'] || item.category.toLowerCase().includes(f['category'].toLowerCase())) &&
        (!f['makeModel'] || makeModel.includes(f['makeModel'].toLowerCase())) &&
        (!f['serialNumber'] || item.serialNumber.toLowerCase().includes(f['serialNumber'].toLowerCase())) &&
        (!f['interval'] || item.calibrationIntervalMonths.toString().includes(f['interval']))
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

  public newEq: CustomerEquipment = {
    id: '0', customerId: '1', customerName: 'AeroSpace Tech LLC', assetTag: '', name: '', serialNumber: '', category: 'Pressure', manufacturer: '', model: '', location: 'Lab A', accuracySpec: '', measurementRange: '', calibrationIntervalMonths: 12, status: EquipmentStatus.Active, isOverdue: false
  };

  ngOnInit() {
    this.api.getEquipments().subscribe({
      next: data => {
        if (data && data.length > 0) this.equipments.set(data);
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
    let csvContent = 'Asset Tag,Instrument Name,Customer,Category,Manufacturer,Model,Serial No,Interval Months,Is Overdue\n';
    data.forEach(row => {
      csvContent += `"${row.assetTag}","${row.name}","${row.customerName}","${row.category}","${row.manufacturer}","${row.model}","${row.serialNumber}","${row.calibrationIntervalMonths}","${row.isOverdue}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Equipment_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveEquipment() {
    if (!this.newEq.assetTag || !this.newEq.name) {
      this.toastService.showWarning('Validation Warning', 'Please provide Asset Tag and Instrument Name.');
      return;
    }

    const created: CustomerEquipment = { ...this.newEq, id: String(Date.now()) };
    this.equipments.update(list => [created, ...list]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Instrument Registered', `Asset ${this.newEq.assetTag} saved to calibration inventory.`);
    this.resetForm();
  }

  resetForm() {
    this.newEq = {
      id: '0', customerId: '1', customerName: 'AeroSpace Tech LLC', assetTag: '', name: '', serialNumber: '', category: 'Pressure', manufacturer: '', model: '', location: 'Lab A', accuracySpec: '', measurementRange: '', calibrationIntervalMonths: 12, status: EquipmentStatus.Active, isOverdue: false
    };
  }
}
