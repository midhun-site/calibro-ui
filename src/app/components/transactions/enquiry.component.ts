import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';
import { EnquiryService } from '../../services/enquiry.service';
import { EnquiryRow } from '../../models/enquiry.model';
import { DataGridState } from '../../common/grid';

export type { EnquiryRow } from '../../models/enquiry.model';

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

/**
 * Component managing Calibration Enquiry records using the reusable DataGridState pattern.
 * Supports filtering on ANY column, dynamic sorting, server pagination, and CSV export.
 */
@Component({
  selector: 'app-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './enquiry.component.html',
  styleUrl: './enquiry.component.css'
})
export class EnquiryComponent implements OnInit {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private enquiryService = inject(EnquiryService);
  protected Math = Math;

  public showCreateModal = false;

  // Generic Reusable Data Grid State Controller
  public grid = new DataGridState<EnquiryRow>({
    defaultSortColumn: 'enquiryNo',
    defaultSortDirection: 'desc',
    defaultPageSize: 15,
    columns: [
      { header: 'Enquiry No', field: 'enquiryNo' },
      { header: 'Customer', field: 'customer' },
      { header: 'Received Date', field: 'receivedDate' },
      { header: 'Instruments Count', field: 'instrumentsCount' },
      { header: 'Service Type', field: 'serviceType' },
      { header: 'Status', field: 'status' }
    ],
    fetchFn: (params) => this.enquiryService.getEnquiries(params)
  });

  // Actions Dropdown Menu State per Row
  public activeActionMenu = signal<string | null>(null);
  public actionMenuDropUp = signal<boolean>(false);

  // View / Edit / Delete Modals State
  public showViewModal = signal<boolean>(false);
  public showEditModal = signal<boolean>(false);
  public showDeleteModal = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);
  public targetEnquiry = signal<EnquiryRow | null>(null);
  public selectedViewEnquiry = signal<EnquiryRow | null>(null);
  public editEnquiryData = signal<EnquiryRow>({ enquiryNo: '', customer: '', receivedDate: '', instrumentsCount: '', serviceType: '', status: 'OPEN' });

  // Bottom History Drawer State
  public selectedEnquiry = signal<EnquiryRow | null>(null);
  public showHistoryDrawer = signal<boolean>(false);
  public activeTab = signal<'audit' | 'timeline'>('audit');

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

  ngOnInit() {
    this.grid.load();
  }

  toggleActionMenu(enquiryNo: string, event: Event) {
    event.stopPropagation();
    if (this.activeActionMenu() === enquiryNo) {
      this.activeActionMenu.set(null);
      this.actionMenuDropUp.set(false);
    } else {
      const target = event.currentTarget as HTMLElement | null;
      if (target) {
        const rect = target.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // If less than 240px available below button, open upwards
        this.actionMenuDropUp.set(spaceBelow < 240);
      } else {
        this.actionMenuDropUp.set(false);
      }
      this.activeActionMenu.set(enquiryNo);
    }
  }

  closeActionMenu() {
    this.activeActionMenu.set(null);
    this.actionMenuDropUp.set(false);
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
    this.grid.items.update(list => list.map(item => item.enquiryNo === updated.enquiryNo ? updated : item));
    this.showEditModal.set(false);
    this.toastService.showSuccess('Enquiry Updated', `${updated.enquiryNo} details saved successfully.`);
  }

  promptDelete(row: EnquiryRow) {
    this.closeActionMenu();
    this.targetEnquiry.set(row);
    this.showDeleteModal.set(true);
  }

  executeDelete() {
    const target = this.targetEnquiry();
    if (!target) return;

    this.isDeleting.set(true);
    const idToPass = target.id && target.id > 0 ? target.id : target.enquiryNo;

    this.enquiryService.deleteEnquiry(idToPass).subscribe({
      next: (res) => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.toastService.showSuccess('Enquiry Deleted', res?.message || `Record ${target.enquiryNo} has been removed.`);
        this.grid.load();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.toastService.showError('Delete Failed', err?.error?.detail || err?.error?.message || `Could not delete enquiry ${target.enquiryNo}.`);
      }
    });
  }

  deleteEnquiry(row: EnquiryRow) {
    this.promptDelete(row);
  }

  closeHistory() {
    this.showHistoryDrawer.set(false);
  }

  setTab(tab: 'audit' | 'timeline') {
    this.activeTab.set(tab);
  }

  exportToCsv() {
    this.grid.exportCsv(`CaliBro_Enquiries_Page_${this.grid.currentPage()}`);
    this.toastService.showSuccess('Export Successful', `Exported ${this.grid.items().length} enquiry records to CSV.`);
  }

  createNewEnquiryPage() {
    this.router.navigate(['/transactions/enquiry/add']);
  }
}
