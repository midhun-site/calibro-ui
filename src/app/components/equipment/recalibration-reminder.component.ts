import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastService } from '../../services/toast.service';

export interface RecalibrationItem {
  id: string;
  assetId: string;
  instrumentName: string;
  serialNo: string;
  customerName: string;
  customerCode: string;
  serviceLocation: string;
  lastCalibDate: string;
  dueDate: string;
  daysRemaining: number;
  status: 'OVERDUE' | 'DUE_7_DAYS' | 'DUE_15_DAYS' | 'DUE_30_DAYS' | 'DUE_60_DAYS' | 'COMPLETED_AUTO_STOPPED';
  recipients: string[];
  lastNotificationSent: string | null;
  selected?: boolean;
}

export interface NotificationLog {
  id: string;
  assetId: string;
  instrumentName: string;
  customerName: string;
  sentDate: string;
  recipients: string;
  intervalTrigger: string;
  status: 'SENT' | 'OPENED' | 'AUTO_STOPPED';
}

@Component({
  selector: 'app-recalibration-reminder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule
  ],
  templateUrl: './recalibration-reminder.component.html',
  styleUrl: './recalibration-reminder.component.css'
})
export class RecalibrationReminderComponent implements OnInit {
  private toastService = inject(ToastService);

  public activeTab = signal<string>('matrix'); // matrix, config, reports, audit

  // Filter Signals
  public globalFilter = signal<string>('');
  public selectedStatusFilter = signal<string>('ALL');

  // Configurable Schedule Rules Signals
  public enable60Days = signal<boolean>(true);
  public enable30Days = signal<boolean>(true);
  public enable15Days = signal<boolean>(true);
  public enable7Days = signal<boolean>(true);
  public enableOverdueAlerts = signal<boolean>(true);
  public defaultCcEmails = signal<string>('qa-manager@apexenergy.ae, lab-services@calibro.ae');
  public emailTemplateSubject = signal<string>('RECALIBRATION DUE NOTICE: [InstrumentName] (Serial: [SerialNo])');
  public emailTemplateBody = signal<string>(
    'Dear Customer,\n\nThis is an automated recalibration reminder from CaliBro Laboratories. Your calibrated equipment [InstrumentName] (Serial: [SerialNo]) is due for recalibration on [DueDate].\n\nPlease submit a recalibration request or contact our lab to schedule intake.\n\nThank you,\nCaliBro Calibration Services'
  );

  // Mock Equipment Data Matrix
  public equipmentItems = signal<RecalibrationItem[]>([
    {
      id: 'REC-101',
      assetId: 'EQ-PRESS-004',
      instrumentName: 'Digital Pressure Gauge 0-10,000 PSI',
      serialNo: 'SN-78041',
      customerName: 'Apex Global Energy Solutions LLC',
      customerCode: 'CUST-1004',
      serviceLocation: 'Sharjah Facility A-4',
      lastCalibDate: '2025-08-20',
      dueDate: '2026-08-20',
      daysRemaining: 6,
      status: 'DUE_7_DAYS',
      recipients: ['qa@apexenergy.ae', 'plant-eng@apexenergy.ae'],
      lastNotificationSent: '2026-08-10 09:30 AM'
    },
    {
      id: 'REC-102',
      assetId: 'EQ-TEMP-012',
      instrumentName: 'Dry Block Temperature Calibrator (-30 to 150°C)',
      serialNo: 'SN-99420',
      customerName: 'Emarat AlOula Contracting',
      customerCode: 'CUST-1009',
      serviceLocation: 'Dubai Site B',
      lastCalibDate: '2025-07-15',
      dueDate: '2026-07-15',
      daysRemaining: -30,
      status: 'OVERDUE',
      recipients: ['site-qa@emarat-aloula.ae'],
      lastNotificationSent: '2026-07-01 10:15 AM'
    },
    {
      id: 'REC-103',
      assetId: 'EQ-ELEC-045',
      instrumentName: '6.5 Digit Precision Multimeter',
      serialNo: 'SN-33104',
      customerName: 'Gulf Petroleum Engineering',
      customerCode: 'CUST-1015',
      serviceLocation: 'Abu Dhabi Refinery',
      lastCalibDate: '2025-09-01',
      dueDate: '2026-09-01',
      daysRemaining: 18,
      status: 'DUE_30_DAYS',
      recipients: ['metering@gulfpetro.ae', 'qa@gulfpetro.ae'],
      lastNotificationSent: '2026-08-01 08:00 AM'
    },
    {
      id: 'REC-104',
      assetId: 'EQ-DIM-088',
      instrumentName: 'Outside Vernier Micrometer 0-25mm',
      serialNo: 'SN-11029',
      customerName: 'Apex Global Energy Solutions LLC',
      customerCode: 'CUST-1004',
      serviceLocation: 'Sharjah Main Lab',
      lastCalibDate: '2025-09-25',
      dueDate: '2026-09-25',
      daysRemaining: 42,
      status: 'DUE_60_DAYS',
      recipients: ['tools@apexenergy.ae'],
      lastNotificationSent: '2026-07-25 11:00 AM'
    },
    {
      id: 'REC-105',
      assetId: 'EQ-MASS-002',
      instrumentName: 'Class F1 Stainless Steel Weight Box Set',
      serialNo: 'SN-MASS-902',
      customerName: 'National Pharmaceutical Works',
      customerCode: 'CUST-1022',
      serviceLocation: 'RAK Cleanroom 1',
      lastCalibDate: '2026-08-10',
      dueDate: '2027-08-10',
      daysRemaining: 361,
      status: 'COMPLETED_AUTO_STOPPED',
      recipients: ['qa-pharma@natpharm.ae'],
      lastNotificationSent: '2026-08-10 (Auto-Stopped)'
    }
  ]);

  // Mock Notification Log
  public auditLogs = signal<NotificationLog[]>([
    { id: 'LOG-8801', assetId: 'EQ-PRESS-004', instrumentName: 'Digital Pressure Gauge', customerName: 'Apex Global Energy', sentDate: '2026-08-10 09:30 AM', recipients: 'qa@apexenergy.ae, plant-eng@apexenergy.ae', intervalTrigger: '7 Days Before Due', status: 'OPENED' },
    { id: 'LOG-8802', assetId: 'EQ-TEMP-012', instrumentName: 'Dry Block Temp Calibrator', customerName: 'Emarat AlOula', sentDate: '2026-07-15 08:00 AM', recipients: 'site-qa@emarat-aloula.ae', intervalTrigger: 'Overdue Notice #1', status: 'SENT' },
    { id: 'LOG-8803', assetId: 'EQ-ELEC-045', instrumentName: 'Precision Multimeter', customerName: 'Gulf Petroleum', sentDate: '2026-08-01 08:00 AM', recipients: 'metering@gulfpetro.ae', intervalTrigger: '30 Days Before Due', status: 'OPENED' },
    { id: 'LOG-8804', assetId: 'EQ-MASS-002', instrumentName: 'Class F1 Weight Box', customerName: 'National Pharma', sentDate: '2026-08-10 02:15 PM', recipients: 'qa-pharma@natpharm.ae', intervalTrigger: 'Calibration Completed', status: 'AUTO_STOPPED' }
  ]);

  // Computed Summary KPIs
  public totalAssetsTracked = computed(() => this.equipmentItems().length);
  public overdueCount = computed(() => this.equipmentItems().filter(i => i.status === 'OVERDUE').length);
  public dueSoonCount = computed(() => this.equipmentItems().filter(i => i.daysRemaining > 0 && i.daysRemaining <= 30).length);
  public autoStoppedCount = computed(() => this.equipmentItems().filter(i => i.status === 'COMPLETED_AUTO_STOPPED').length);

  // Computed Filtered List
  public filteredEquipment = computed(() => {
    let list = this.equipmentItems();
    const query = this.globalFilter().toLowerCase().trim();
    const statusFilter = this.selectedStatusFilter();

    if (statusFilter !== 'ALL') {
      list = list.filter(item => item.status === statusFilter);
    }

    if (query) {
      list = list.filter(
        item =>
          item.assetId.toLowerCase().includes(query) ||
          item.instrumentName.toLowerCase().includes(query) ||
          item.serialNo.toLowerCase().includes(query) ||
          item.customerName.toLowerCase().includes(query)
      );
    }

    return list;
  });

  ngOnInit() {}

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'OVERDUE': return 'danger';
      case 'DUE_7_DAYS': return 'warn';
      case 'DUE_15_DAYS': return 'warn';
      case 'DUE_30_DAYS': return 'info';
      case 'DUE_60_DAYS': return 'info';
      case 'COMPLETED_AUTO_STOPPED': return 'success';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'OVERDUE': return 'Overdue Alert';
      case 'DUE_7_DAYS': return 'Due in 7 Days';
      case 'DUE_15_DAYS': return 'Due in 15 Days';
      case 'DUE_30_DAYS': return 'Due in 30 Days';
      case 'DUE_60_DAYS': return 'Due in 60 Days';
      case 'COMPLETED_AUTO_STOPPED': return 'Calibrated (Auto-Stopped)';
      default: return status;
    }
  }

  sendReminder(item: RecalibrationItem) {
    this.toastService.showSuccess(
      'Reminder Sent',
      `Recalibration notice for ${item.instrumentName} (${item.serialNo}) sent to ${item.recipients.join(', ')}.`
    );
    item.lastNotificationSent = new Date().toLocaleString();
  }

  sendSelectedBatchReminders() {
    const selected = this.equipmentItems().filter(i => i.selected);
    if (selected.length === 0) {
      this.toastService.showError('Selection Error', 'Please select at least one equipment item to send reminders.');
      return;
    }
    this.toastService.showSuccess(
      'Batch Reminders Sent',
      `Recalibration notification emails dispatched for ${selected.length} selected equipment assets.`
    );
  }

  markCalibrated(item: RecalibrationItem) {
    item.status = 'COMPLETED_AUTO_STOPPED';
    item.daysRemaining = 365;
    item.lastNotificationSent = `${new Date().toLocaleDateString()} (Auto-Stopped)`;
    this.toastService.showSuccess(
      'Recalibration Completed',
      `Asset ${item.assetId} recalibration recorded. Active reminders automatically stopped.`
    );
  }

  saveSettings() {
    this.toastService.showSuccess('Settings Saved', 'Recalibration reminder interval rules & email templates updated successfully.');
  }

  exportReportCsv() {
    this.toastService.showSuccess('Export CSV', 'Recalibration Reminder Register exported to CSV.');
  }

  printReport() {
    window.print();
  }
}
