import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface UserItem {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;
  public Math = Math;

  public users = signal<UserItem[]>([
    { userId: 'USR-1001', fullName: 'Alex Rivera', email: 'alex.rivera@calibro.com', role: 'Senior Metrologist', department: 'Thermal & Pressure Lab', status: 'ACTIVE' },
    { userId: 'USR-1002', fullName: 'Dr. Marcus Vance', email: 'marcus.vance@calibro.com', role: 'Technical Signatory', department: 'Quality Assurance', status: 'ACTIVE' },
    { userId: 'USR-1003', fullName: 'Sarah Connor', email: 'sarah.connor@calibro.com', role: 'Calibration Engineer', department: 'Flow & Torque Lab', status: 'ACTIVE' },
    { userId: 'USR-1004', fullName: 'Sarah Jenkins', email: 'sarah.jenkins@calibro.com', role: 'Metrology Technician', department: 'Electrical & RF Lab', status: 'ACTIVE' },
    { userId: 'USR-1005', fullName: 'David Miller', email: 'david.miller@calibro.com', role: 'CRM Account Manager', department: 'Customer Success', status: 'ACTIVE' },
    { userId: 'USR-1006', fullName: 'Rachel Adams', email: 'rachel.adams@calibro.com', role: 'Logistics Coordinator', department: 'Intake & Dispatch', status: 'ACTIVE' },
    { userId: 'USR-1007', fullName: 'Michael Scott', email: 'michael.scott@calibro.com', role: 'Lab Director', department: 'Executive Management', status: 'ACTIVE' },
    { userId: 'USR-1008', fullName: 'Jessica Pearson', email: 'jessica.pearson@calibro.com', role: 'Quality Manager', department: 'ISO 17025 Compliance', status: 'ACTIVE' }
  ]);

  public filters = signal<{ [key: string]: string }>({
    userId: '', fullName: '', email: '', role: '', department: '', status: ''
  });

  public sortColumn = signal<string>('userId');
  public sortDirection = signal<'asc' | 'desc'>('asc');

  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public filteredData = computed(() => {
    const data = this.users();
    const f = this.filters();
    return data.filter(item => {
      return (
        (!f['userId'] || item.userId.toLowerCase().includes(f['userId'].toLowerCase())) &&
        (!f['fullName'] || item.fullName.toLowerCase().includes(f['fullName'].toLowerCase())) &&
        (!f['email'] || item.email.toLowerCase().includes(f['email'].toLowerCase())) &&
        (!f['role'] || item.role.toLowerCase().includes(f['role'].toLowerCase())) &&
        (!f['department'] || item.department.toLowerCase().includes(f['department'].toLowerCase())) &&
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

  public newUser = { fullName: '', email: '', role: 'Metrologist', department: '' };

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
    let csvContent = 'User ID,Full Name,Email,Role,Department,Status\n';
    data.forEach(row => {
      csvContent += `"${row.userId}","${row.fullName}","${row.email}","${row.role}","${row.department}","${row.status}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_System_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} records to CSV.`);
  }

  saveUser() {
    if (!this.newUser.fullName || !this.newUser.email) {
      this.toastService.showWarning('Required Field', 'Please enter Full Name and Email Address.');
      return;
    }
    const newId = `USR-${this.users().length + 1001}`;
    this.users.update(list => [
      {
        userId: newId,
        fullName: this.newUser.fullName,
        email: this.newUser.email,
        role: this.newUser.role || 'Metrologist',
        department: this.newUser.department || 'Lab Operations',
        status: 'ACTIVE'
      },
      ...list
    ]);
    this.showCreateModal = false;
    this.toastService.showSuccess('User Account Created', `User ${this.newUser.fullName} registered.`);
    this.newUser = { fullName: '', email: '', role: 'Metrologist', department: '' };
  }
}
