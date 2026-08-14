import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';

export interface CustomerJobProgress {
  jobNo: string;
  woNo: string;
  instrumentName: string;
  serialNo: string;
  intakeDate: string;
  expectedDate: string;
  currentStep: number; // 1: Received, 2: Under Review, 3: Calibrating, 4: QA Signoff, 5: Ready for Dispatch
  statusLabel: string;
}

export interface CustomerInstrument {
  assetId: string;
  description: string;
  makeModel: string;
  serialNo: string;
  lastCalibDate: string;
  dueDate: string;
  certNo: string;
  status: 'VALID' | 'DUE_SOON' | 'EXPIRED';
}

export interface CustomerInvoice {
  invoiceNo: string;
  date: string;
  amount: string;
  tax: string;
  total: string;
  status: 'PAID' | 'UNPAID';
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css'
})
export class CustomerDashboardComponent implements OnInit {
  private router = inject(Router);
  private toastService = inject(ToastService);
  public themeService = inject(ThemeService);

  public activeTab = signal<string>('progress'); // progress, history, certs, invoices, due-dates, submit-job, request-quote
  public customerName = signal<string>('Apex Global Energy Solutions LLC');
  public customerCode = signal<string>('CUST-AE-8902');

  // New Calibration Job Submission Form
  public newJob = {
    instrumentName: '',
    makeModel: '',
    serialNo: '',
    serviceType: 'In-Lab Calibration',
    urgency: 'Standard (3-5 Days)',
    notes: ''
  };

  // Quote Request Form
  public newQuote = {
    contactPerson: 'Mr. David Miller',
    email: 'client@apexenergy.ae',
    phone: '+971 4 8839201',
    scopeDetails: '',
    estimatedQuantity: 5
  };

  // Live Tracked Jobs Data
  public jobs = signal<CustomerJobProgress[]>([
    { jobNo: 'JOB-2026-081', woNo: 'WO-2026-9104', instrumentName: '4-Gas Personal Monitor (H2S/CO/O2/LEL)', serialNo: 'SN-99120', intakeDate: '2026-08-10', expectedDate: '2026-08-16', currentStep: 3, statusLabel: 'Calibrating in Laboratory' },
    { jobNo: 'JOB-2026-079', woNo: 'WO-2026-8910', instrumentName: 'Digital Pressure Indicator Gauge 10,000 PSI', serialNo: 'SN-78041', intakeDate: '2026-08-09', expectedDate: '2026-08-15', currentStep: 4, statusLabel: 'Quality Assurance Signoff' },
    { jobNo: 'JOB-2026-075', woNo: 'WO-2026-8712', instrumentName: 'Multifunction Electrical Calibrator 5522A', serialNo: 'SN-88201', intakeDate: '2026-08-05', expectedDate: '2026-08-11', currentStep: 5, statusLabel: 'Ready for Dispatch' }
  ]);

  // Instrument History Data
  public instruments = signal<CustomerInstrument[]>([
    { assetId: 'EQ-GAS-01', description: '4-Gas Personal Monitor (H2S/CO/O2/LEL)', makeModel: 'Honeywell (BW MAX XT II)', serialNo: 'SN-99120', lastCalibDate: '2025-08-15', dueDate: '2026-08-15', certNo: 'CERT-2025-9014', status: 'DUE_SOON' },
    { assetId: 'EQ-PRESS-04', description: 'Digital Pressure Indicator Gauge', makeModel: 'Fluke Calibration (700G31)', serialNo: 'SN-78041', lastCalibDate: '2026-08-08', dueDate: '2027-08-08', certNo: 'CERT-2026-1048', status: 'VALID' },
    { assetId: 'EQ-TEMP-02', description: 'Precision Temperature Bath', makeModel: 'Isotech (Jupiter 650)', serialNo: 'SN-54902', lastCalibDate: '2025-09-01', dueDate: '2026-09-01', certNo: 'CERT-2025-8812', status: 'VALID' },
    { assetId: 'EQ-ELEC-01', description: 'Multifunction Calibrator 5522A', makeModel: 'Fluke (5522A)', serialNo: 'SN-88201', lastCalibDate: '2024-07-20', dueDate: '2025-07-20', certNo: 'CERT-2024-7104', status: 'EXPIRED' }
  ]);

  // Invoices Data
  public invoices = signal<CustomerInvoice[]>([
    { invoiceNo: 'INV-2026-042', date: '2026-08-10', amount: '1,200.00 AED', tax: '60.00 AED', total: '1,260.00 AED', status: 'UNPAID' },
    { invoiceNo: 'INV-2026-018', date: '2026-07-15', amount: '3,400.00 AED', tax: '170.00 AED', total: '3,570.00 AED', status: 'PAID' },
    { invoiceNo: 'INV-2026-004', date: '2026-05-20', amount: '950.00 AED', tax: '47.50 AED', total: '997.50 AED', status: 'PAID' }
  ]);

  ngOnInit() {
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  downloadCert(certNo: string) {
    window.open('/certificates/view/' + certNo, '_blank');
  }

  downloadInvoice(invNo: string) {
    this.toastService.showSuccess('Downloading Invoice', `Downloading Tax Invoice ${invNo}.pdf`);
  }

  submitJobRequest() {
    if (!this.newJob.instrumentName || !this.newJob.serialNo) {
      this.toastService.showError('Validation Error', 'Please enter instrument name and serial number.');
      return;
    }

    const randomJobNo = `JOB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newEntry: CustomerJobProgress = {
      jobNo: randomJobNo,
      woNo: `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      instrumentName: this.newJob.instrumentName,
      serialNo: this.newJob.serialNo,
      intakeDate: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      currentStep: 1,
      statusLabel: 'Received at Lab Intake'
    };

    this.jobs.update(list => [newEntry, ...list]);
    this.toastService.showSuccess('Job Request Submitted', `Submitted online intake request #${randomJobNo}.`);
    this.newJob = { instrumentName: '', makeModel: '', serialNo: '', serviceType: 'In-Lab Calibration', urgency: 'Standard (3-5 Days)', notes: '' };
    this.activeTab.set('progress');
  }

  submitQuoteRequest() {
    if (!this.newQuote.scopeDetails) {
      this.toastService.showError('Validation Error', 'Please provide calibration scope details.');
      return;
    }

    this.toastService.showSuccess('Quotation Request Sent', 'Commercial metrology lead will issue proposal within 24 hours.');
    this.newQuote.scopeDetails = '';
    this.activeTab.set('progress');
  }

  logout() {
    this.toastService.showInfo('Logged Out', 'Successfully logged out of Customer Portal.');
    this.router.navigate(['/customer/login']);
  }
}
