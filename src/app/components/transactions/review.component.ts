import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface ReviewItem {
  reviewNo: string;
  enquiryRef: string;
  customer: string;
  scope: string;
  assessment: string;
  status: string;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public reviews = signal<ReviewItem[]>([
    { reviewNo: 'REV-2026-031', enquiryRef: 'ENQ-2026-081', customer: 'AeroSpace Tech LLC', scope: 'High Pressure (10,000 PSI)', assessment: 'Approved within ISO Scope', status: 'ACCEPTED' },
    { reviewNo: 'REV-2026-032', enquiryRef: 'ENQ-2026-082', customer: 'BioPharm Solutions', scope: 'Ultra-low Temp (-80°C)', assessment: 'Approved - In-House Lab', status: 'PENDING' },
    { reviewNo: 'REV-2026-033', enquiryRef: 'ENQ-2026-083', customer: 'Global Energy Ltd', scope: 'Nuclear Radiation Calibration', assessment: 'Exceeds Lab Capability', status: 'REJECTED' },
    { reviewNo: 'REV-2026-034', enquiryRef: 'ENQ-2026-084', customer: 'Precision Eng Co', scope: 'Torque Wrench Calibration (2000 Nm)', assessment: 'Approved - Standard Bench', status: 'ACCEPTED' },
    { reviewNo: 'REV-2026-035', enquiryRef: 'ENQ-2026-085', customer: 'Emarat Aloula Contracting', scope: 'Gas Detectors (Multi-Gas)', assessment: 'Approved - Gas Ref Standard', status: 'ACCEPTED' },
    { reviewNo: 'REV-2026-036', enquiryRef: 'ENQ-2026-086', customer: 'Gulf Marine Services', scope: 'Ultrasonic Flow Meters', assessment: 'Subcontract Review Needed', status: 'PENDING' },
    { reviewNo: 'REV-2026-037', enquiryRef: 'ENQ-2026-087', customer: 'Apex Medical Labs', scope: 'Micropipettes & Balances', assessment: 'Approved - Class E2 Mass', status: 'ACCEPTED' },
    { reviewNo: 'REV-2026-038', enquiryRef: 'ENQ-2026-088', customer: 'PetroChem Refineries', scope: 'Differential Pressure Transmitters', assessment: 'Approved - Deadweight Tester', status: 'ACCEPTED' },
    { reviewNo: 'REV-2026-039', enquiryRef: 'ENQ-2026-089', customer: 'Al Futtaim Engineering', scope: 'Laser Tachometers & Stroboscopes', assessment: 'Approved - Optical Standard', status: 'ACCEPTED' },
    { reviewNo: 'REV-2026-040', enquiryRef: 'ENQ-2026-090', customer: 'Emirates Steel Industries', scope: 'High Capacity Load Cells (100 Ton)', assessment: 'Approved - Heavy Load Rig', status: 'ACCEPTED' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    reviewNo: '', enquiryRef: '', customer: '', scope: '', assessment: '', status: ''
  });

  public sortColumn = signal<string>('reviewNo');
  public sortDirection = signal<'asc' | 'desc'>('desc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.reviews();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['reviewNo'] || item.reviewNo.toLowerCase().includes(f['reviewNo'].toLowerCase())) &&
        (!f['enquiryRef'] || item.enquiryRef.toLowerCase().includes(f['enquiryRef'].toLowerCase())) &&
        (!f['customer'] || item.customer.toLowerCase().includes(f['customer'].toLowerCase())) &&
        (!f['scope'] || item.scope.toLowerCase().includes(f['scope'].toLowerCase())) &&
        (!f['assessment'] || item.assessment.toLowerCase().includes(f['assessment'].toLowerCase())) &&
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

  public newReview = { enquiryRef: '', customer: '', scope: '', assessment: 'ISO 17025 Capable' };

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
    let csvContent = 'Review No,Enquiry Ref,Customer,Discipline Scope,Capability Assessment,Status\n';
    data.forEach(row => {
      csvContent += `"${row.reviewNo}","${row.enquiryRef}","${row.customer}","${row.scope}","${row.assessment}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Contract_Reviews_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveReview() {
    if (!this.newReview.customer || !this.newReview.enquiryRef) {
      this.toastService.showWarning('Required Field', 'Please enter Enquiry Ref and Customer Name.');
      return;
    }
    const newNo = `REV-2026-0${this.reviews().length + 31}`;
    this.reviews.update(list => [
      {
        reviewNo: newNo,
        enquiryRef: this.newReview.enquiryRef,
        customer: this.newReview.customer,
        scope: this.newReview.scope || 'General Metrology Scope',
        assessment: this.newReview.assessment || 'ISO 17025 Capable',
        status: 'ACCEPTED'
      },
      ...list
    ]);
    this.showCreateModal = false;
    this.toastService.showSuccess('Contract Review Saved', `Technical review ${newNo} added successfully.`);
    this.newReview = { enquiryRef: '', customer: '', scope: '', assessment: 'ISO 17025 Capable' };
  }
}
