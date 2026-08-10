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

export interface AuditLogItem {
  id: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  action: string;
  details: string;
  timestamp: string;
  relativeTime: string;
  category: 'create' | 'review' | 'quote' | 'intake' | 'workorder' | 'certificate' | 'dispatch' | 'invoice';
}

export interface TimelineStage {
  stageName: string;
  refNo?: string;
  status: 'completed' | 'active' | 'pending';
  timestamp?: string;
  performedBy?: string;
  icon: string;
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

  // Actions Dropdown Menu State per Row
  public activeActionMenu = signal<string | null>(null);

  // View / Edit Modals State
  public showViewModal = signal<boolean>(false);
  public showEditModal = signal<boolean>(false);
  public selectedViewEnquiry = signal<EnquiryRow | null>(null);
  public editEnquiryData = signal<EnquiryRow>({ enquiryNo: '', customer: '', receivedDate: '', instrumentsCount: '', serviceType: '', status: 'OPEN' });

  // Bottom History Drawer State
  public selectedEnquiry = signal<EnquiryRow | null>(null);
  public showHistoryDrawer = signal<boolean>(false);
  public activeTab = signal<'audit' | 'timeline'>('audit');

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

  // Dynamic Audit Logs for Selected Enquiry
  public auditLogs = computed<AuditLogItem[]>(() => {
    const enquiry = this.selectedEnquiry();
    if (!enquiry) return [];

    const date = enquiry.receivedDate;

    return [
      {
        id: '1',
        userName: 'Alex Rivera',
        userRole: 'Senior Metrologist',
        userAvatar: 'AR',
        action: 'Created Calibration Enquiry',
        details: `Initial enquiry intake for ${enquiry.customer} (${enquiry.instrumentsCount}).`,
        timestamp: `${date} 09:15:22`,
        relativeTime: '2 hours ago',
        category: 'create'
      },
      {
        id: '2',
        userName: 'Dr. Marcus Vance',
        userRole: 'Technical Signatory',
        userAvatar: 'MV',
        action: 'Contract Review & Capability Assessment',
        details: 'Approved ISO 17025 accredited scope capability for requested equipment range.',
        timestamp: `${date} 10:45:10`,
        relativeTime: '1 hour ago',
        category: 'review'
      },
      {
        id: '3',
        userName: 'Sarah Connor',
        userRole: 'Metrology Technician',
        userAvatar: 'SC',
        action: 'Generated Price Proposal',
        details: `Created commercial quotation proposal QT-2026-049 for ${enquiry.customer}.`,
        timestamp: `${date} 11:30:00`,
        relativeTime: '45 mins ago',
        category: 'quote'
      },
      {
        id: '4',
        userName: 'Rachel Adams',
        userRole: 'Logistics Coordinator',
        userAvatar: 'RA',
        action: 'Logged Delivery In Intake',
        details: 'Physical equipment received at Lab Gate Pass DIN-2026-088.',
        timestamp: `${date} 14:10:05`,
        relativeTime: '15 mins ago',
        category: 'intake'
      }
    ];
  });

  // Dynamic Pipeline Stage Timeline (Enquiry to Invoice)
  public pipelineTimeline = computed<TimelineStage[]>(() => {
    const enquiry = this.selectedEnquiry();
    if (!enquiry) return [];

    const isQuoted = enquiry.status === 'QUOTED' || enquiry.status === 'APPROVED';
    const isApproved = enquiry.status === 'APPROVED';

    return [
      {
        stageName: 'Enquiry Received',
        refNo: enquiry.enquiryNo,
        status: 'completed',
        timestamp: `${enquiry.receivedDate} 09:15`,
        performedBy: 'Alex Rivera',
        icon: 'pi-question-circle'
      },
      {
        stageName: 'Contract Review',
        refNo: 'REV-2026-031',
        status: 'completed',
        timestamp: `${enquiry.receivedDate} 10:45`,
        performedBy: 'Dr. Marcus Vance',
        icon: 'pi-check-square'
      },
      {
        stageName: 'Quotation Sent',
        refNo: 'QT-2026-049',
        status: isQuoted ? 'completed' : 'active',
        timestamp: isQuoted ? `${enquiry.receivedDate} 11:30` : undefined,
        performedBy: 'Sarah Connor',
        icon: 'pi-file-edit'
      },
      {
        stageName: 'Equipment Intake (DIN)',
        refNo: 'DIN-2026-088',
        status: isApproved ? 'completed' : isQuoted ? 'active' : 'pending',
        timestamp: isApproved ? `${enquiry.receivedDate} 14:10` : undefined,
        performedBy: 'Rachel Adams',
        icon: 'pi-box'
      },
      {
        stageName: 'Workorder Execution',
        refNo: 'WO-2026-001',
        status: isApproved ? 'active' : 'pending',
        timestamp: undefined,
        performedBy: 'Alex Rivera',
        icon: 'pi-cog'
      },
      {
        stageName: 'Calibration Certificate',
        refNo: 'CERT-2026-8891',
        status: 'pending',
        timestamp: undefined,
        performedBy: 'Dr. Marcus Vance',
        icon: 'pi-verified'
      },
      {
        stageName: 'Delivery Ticket Dispatch',
        refNo: 'DT-2026-077',
        status: 'pending',
        timestamp: undefined,
        performedBy: 'Rachel Adams',
        icon: 'pi-send'
      },
      {
        stageName: 'Invoice Billing',
        refNo: 'INV-2026-0042',
        status: 'pending',
        timestamp: undefined,
        performedBy: 'Finance Dept',
        icon: 'pi-receipt'
      }
    ];
  });

  toggleActionMenu(enquiryNo: string, event: Event) {
    event.stopPropagation();
    if (this.activeActionMenu() === enquiryNo) {
      this.activeActionMenu.set(null);
    } else {
      this.activeActionMenu.set(enquiryNo);
    }
  }

  closeActionMenu() {
    this.activeActionMenu.set(null);
  }

  // Action Menu Handlers
  openHistory(row: EnquiryRow) {
    this.closeActionMenu();
    this.selectedEnquiry.set(row);
    this.showHistoryDrawer.set(true);
    this.activeTab.set('audit');
  }

  viewEnquiry(row: EnquiryRow) {
    this.closeActionMenu();
    this.selectedViewEnquiry.set(row);
    this.showViewModal.set(true);
  }

  editEnquiry(row: EnquiryRow) {
    this.closeActionMenu();
    this.router.navigate(['/transactions/enquiry/add', row.enquiryNo]);
  }

  printEnquiry(row: EnquiryRow) {
    this.closeActionMenu();
    window.open('/transactions/enquiry/print/' + row.enquiryNo, '_blank');
  }

  saveEditEnquiry() {
    const updated = this.editEnquiryData();
    this.rawData.update(list => list.map(item => item.enquiryNo === updated.enquiryNo ? updated : item));
    this.showEditModal.set(false);
    this.toastService.showSuccess('Enquiry Updated', `${updated.enquiryNo} details saved successfully.`);
  }

  deleteEnquiry(row: EnquiryRow) {
    this.closeActionMenu();
    if (confirm(`Are you sure you want to delete Enquiry ${row.enquiryNo} for ${row.customer}?`)) {
      this.rawData.update(list => list.filter(item => item.enquiryNo !== row.enquiryNo));
      this.toastService.showSuccess('Enquiry Deleted', `Record ${row.enquiryNo} has been removed.`);
    }
  }

  closeHistory() {
    this.showHistoryDrawer.set(false);
  }

  setTab(tab: 'audit' | 'timeline') {
    this.activeTab.set(tab);
  }

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
