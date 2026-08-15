import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ToastService } from '../../services/toast.service';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  ipAddress: string;
  module: 'Certificates' | 'Transactions' | 'Equipment' | 'QC' | 'Settings' | 'Security';
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE';
  activitySummary: string;
  entityId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  payloadDetails?: {
    browser?: string;
    location?: string;
    beforeState?: any;
    afterState?: any;
  };
}

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule],
  templateUrl: './audit-trail.component.html',
  styleUrl: './audit-trail.component.css'
})
export class AuditTrailComponent {
  private toastService = inject(ToastService);
  public Math = Math;

  // Filter Signals
  globalSearch = signal<string>('');
  fromDate = signal<string>('2026-08-01');
  toDate = signal<string>('2026-08-15');
  selectedUser = signal<string>('ALL');
  selectedModule = signal<string>('ALL');
  selectedSeverity = signal<string>('ALL');
  selectedAction = signal<string>('ALL');

  // Modal Detail State
  selectedLogEntry = signal<AuditLogEntry | null>(null);
  showDetailModal = signal<boolean>(false);

  // Sorting & Pagination
  sortColumn = signal<string>('timestamp');
  sortDirection = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Master Audit Logs Data
  auditLogs = signal<AuditLogEntry[]>([
    {
      id: 'LOG-2026-9041',
      timestamp: '15/08/2026 12:24:10',
      userName: 'Alex Rivera',
      userRole: 'Senior Metrologist',
      userAvatar: 'AR',
      ipAddress: '192.168.1.104',
      module: 'Certificates',
      actionType: 'CREATE',
      activitySummary: 'Generated ISO 17025 Calibration Certificate CERT-2026-1048 for Digital Pressure Gauge',
      entityId: 'CERT-2026-1048',
      severity: 'INFO',
      payloadDetails: {
        browser: 'Chrome 127.0.0.0 (Windows 11)',
        location: 'Sharjah Main Lab 1',
        beforeState: { status: 'Draft' },
        afterState: { status: 'Issued', certNo: 'CERT-2026-1048', issuedBy: 'Alex Rivera', result: 'PASS' }
      }
    },
    {
      id: 'LOG-2026-9040',
      timestamp: '15/08/2026 11:45:02',
      userName: 'Dr. Marcus Vance',
      userRole: 'Quality Manager',
      userAvatar: 'MV',
      ipAddress: '192.168.1.110',
      module: 'Certificates',
      actionType: 'UPDATE',
      activitySummary: 'Approved & Digitally Signed CTR Data Sheet Page 2 for CERT-2026-1048',
      entityId: 'CERT-2026-1048',
      severity: 'INFO',
      payloadDetails: {
        browser: 'Firefox 128.0 (Windows 11)',
        location: 'QA Office',
        beforeState: { verified: false },
        afterState: { verified: true, signDate: '2026-08-15 11:45:02' }
      }
    },
    {
      id: 'LOG-2026-9039',
      timestamp: '15/08/2026 10:15:33',
      userName: 'System Administrator',
      userRole: 'Super Admin',
      userAvatar: 'SA',
      ipAddress: '10.0.4.12',
      module: 'Security',
      actionType: 'PERMISSION_CHANGE',
      activitySummary: 'Updated Role Permissions for Senior Metrologist Group (Granted Manual CTR Editing)',
      entityId: 'ROLE-METROLOGIST',
      severity: 'WARNING',
      payloadDetails: {
        browser: 'Edge 127.0 (Windows 11)',
        location: 'Admin Portal',
        beforeState: { canEditManualCtr: false },
        afterState: { canEditManualCtr: true, modifiedBy: 'Admin' }
      }
    },
    {
      id: 'LOG-2026-9038',
      timestamp: '15/08/2026 09:30:00',
      userName: 'Alex Rivera',
      userRole: 'Senior Metrologist',
      userAvatar: 'AR',
      ipAddress: '192.168.1.104',
      module: 'Equipment',
      actionType: 'UPDATE',
      activitySummary: 'Completed Recalibration & Reset Reminders for Master Equipment EQ-PRESS-004',
      entityId: 'EQ-PRESS-004',
      severity: 'INFO',
      payloadDetails: {
        browser: 'Chrome 127.0 (Windows 11)',
        location: 'Lab 1',
        beforeState: { daysUntilDue: 5, status: 'DUE_SOON' },
        afterState: { lastCalDate: '2026-08-15', nextDueDate: '2027-08-15', status: 'CALIBRATED' }
      }
    },
    {
      id: 'LOG-2026-9037',
      timestamp: '14/08/2026 16:50:12',
      userName: 'Fatima Al-Zahra',
      userRole: 'Customer Support Lead',
      userAvatar: 'FA',
      ipAddress: '192.168.1.115',
      module: 'Transactions',
      actionType: 'CREATE',
      activitySummary: 'Created New Calibration Job Entry ENQ-2026-4409 for Apex Global Energy',
      entityId: 'ENQ-2026-4409',
      severity: 'INFO',
      payloadDetails: {
        browser: 'Chrome 127.0',
        location: 'Front Desk',
        beforeState: null,
        afterState: { customer: 'Apex Global Energy Solutions', itemCount: 4, val: 12500 }
      }
    },
    {
      id: 'LOG-2026-9036',
      timestamp: '14/08/2026 15:10:45',
      userName: 'Unrecognized User',
      userRole: 'Guest',
      userAvatar: '??',
      ipAddress: '185.220.101.4',
      module: 'Security',
      actionType: 'LOGIN',
      activitySummary: 'Failed Password Login Attempt for user account admin@calibro.ae (IP Blocked)',
      entityId: 'AUTH-FAIL-302',
      severity: 'CRITICAL',
      payloadDetails: {
        browser: 'Unknown/Botnet',
        location: 'External IP 185.220.101.4',
        beforeState: null,
        afterState: { attemptCount: 5, blockReason: 'Invalid Credentials Brute Force' }
      }
    },
    {
      id: 'LOG-2026-9035',
      timestamp: '14/08/2026 14:02:18',
      userName: 'System Administrator',
      userRole: 'Super Admin',
      userAvatar: 'SA',
      ipAddress: '10.0.4.12',
      module: 'Settings',
      actionType: 'UPDATE',
      activitySummary: 'Updated Company SMTP Server credentials & Report Header Banner upload',
      entityId: 'SETTINGS-COMPANY',
      severity: 'WARNING',
      payloadDetails: {
        browser: 'Chrome 127.0',
        location: 'Settings Workspace',
        beforeState: { smtpPort: 25 },
        afterState: { smtpPort: 587, bannerUploaded: true }
      }
    },
    {
      id: 'LOG-2026-9034',
      timestamp: '14/08/2026 11:20:00',
      userName: 'Alex Rivera',
      userRole: 'Senior Metrologist',
      userAvatar: 'AR',
      ipAddress: '192.168.1.104',
      module: 'QC',
      actionType: 'EXPORT',
      activitySummary: 'Exported ISO 17025 Uncertainty Budget Spreadsheet CSV for Pressure Gauge 0-10,000 PSI',
      entityId: 'UNC-SHEET-01',
      severity: 'INFO',
      payloadDetails: {
        browser: 'Chrome 127.0',
        location: 'QC Lab',
        beforeState: null,
        afterState: { format: 'CSV', rowsExported: 18 }
      }
    },
    {
      id: 'LOG-2026-9033',
      timestamp: '14/08/2026 08:30:15',
      userName: 'Alex Rivera',
      userRole: 'Senior Metrologist',
      userAvatar: 'AR',
      ipAddress: '192.168.1.104',
      module: 'Security',
      actionType: 'LOGIN',
      activitySummary: 'Successful User Authentication (Session Started)',
      entityId: 'SESS-88402',
      severity: 'INFO',
      payloadDetails: {
        browser: 'Chrome 127.0',
        location: 'Sharjah Lab 1',
        beforeState: null,
        afterState: { sessionToken: 'JWT_EXPIRE_24H' }
      }
    },
    {
      id: 'LOG-2026-9032',
      timestamp: '13/08/2026 17:15:00',
      userName: 'Dr. Marcus Vance',
      userRole: 'Quality Manager',
      userAvatar: 'MV',
      ipAddress: '192.168.1.110',
      module: 'QC',
      actionType: 'UPDATE',
      activitySummary: 'Updated SOP Reference Procedure CAL-SOP-EC-01 to Revision 4.0',
      entityId: 'CAL-SOP-EC-01',
      severity: 'INFO',
      payloadDetails: {
        browser: 'Firefox 128.0',
        location: 'QA Office',
        beforeState: { rev: 'Rev 3.0' },
        afterState: { rev: 'Rev 4.0', approvedBy: 'Dr. Marcus Vance' }
      }
    }
  ]);

  // Computed Filtered Logs
  filteredLogs = computed(() => {
    let list = this.auditLogs();
    const search = this.globalSearch().toLowerCase().trim();
    const userFilter = this.selectedUser();
    const moduleFilter = this.selectedModule();
    const severityFilter = this.selectedSeverity();
    const actionFilter = this.selectedAction();

    return list.filter(item => {
      // Global Search
      if (search) {
        const matchesSearch =
          item.id.toLowerCase().includes(search) ||
          item.userName.toLowerCase().includes(search) ||
          item.activitySummary.toLowerCase().includes(search) ||
          item.entityId.toLowerCase().includes(search) ||
          item.ipAddress.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // User Filter
      if (userFilter !== 'ALL' && item.userName !== userFilter) return false;

      // Module Filter
      if (moduleFilter !== 'ALL' && item.module !== moduleFilter) return false;

      // Severity Filter
      if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;

      // Action Filter
      if (actionFilter !== 'ALL' && item.actionType !== actionFilter) return false;

      return true;
    });
  });

  // KPI Metrics
  totalEventsCount = computed(() => this.auditLogs().length);
  todayEventsCount = computed(() => this.auditLogs().filter(l => l.timestamp.startsWith('15/08/2026')).length);
  securityAlertsCount = computed(() => this.auditLogs().filter(l => l.severity === 'WARNING' || l.severity === 'CRITICAL').length);

  // Paginated Data
  paginatedLogs = computed(() => {
    const list = this.filteredLogs();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredLogs().length / this.pageSize()) || 1;
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  resetFilters() {
    this.globalSearch.set('');
    this.fromDate.set('2026-08-01');
    this.toDate.set('2026-08-15');
    this.selectedUser.set('ALL');
    this.selectedModule.set('ALL');
    this.selectedSeverity.set('ALL');
    this.selectedAction.set('ALL');
    this.currentPage.set(1);
    this.toastService.showInfo('Filters Reset', 'Cleared all audit log filters.');
  }

  viewLogDetails(entry: AuditLogEntry) {
    this.selectedLogEntry.set(entry);
    this.showDetailModal.set(true);
  }

  closeModal() {
    this.showDetailModal.set(false);
  }

  exportCsv() {
    this.toastService.showSuccess('Export Complete', 'Exported audit trail log dataset to CSV.');
  }

  exportPdf() {
    this.toastService.showSuccess('Export Complete', 'Exported printable ISO 17025 Audit Trail PDF Log.');
  }
}
