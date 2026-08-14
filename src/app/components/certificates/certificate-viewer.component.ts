import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ToastService } from '../../services/toast.service';

export interface MeasurementResultRow {
  nominal: string;
  asFound: string;
  asLeft: string;
  error: string;
  status: 'PASS' | 'FAIL';
}

export interface MasterEquipRow {
  description: string;
  srNo: string;
  model: string;
  dueDate: string;
  traceability: string;
}

@Component({
  selector: 'app-certificate-viewer',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './certificate-viewer.component.html',
  styleUrl: './certificate-viewer.component.css'
})
export class CertificateViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  public certNo = signal<string>('CERT-2026-1048');
  public woNo = signal<string>('WO-2026-9104');
  public issueDate = signal<string>('2026-08-10');
  public calibDate = signal<string>('2026-08-09');
  public dueDate = signal<string>('2027-08-09');
  public serviceLocation = signal<string>('In-Lab (Laboratory)');

  public customerName = signal<string>('Apex Global Energy Solutions LLC');
  public customerAddress = signal<string>('Facility A-4, Sharjah Industrial Park, Sharjah, UAE');
  public mName = signal<string>('GTP Facility');
  public mAddress = signal<string>('Sharjah Industrial Zone 4, UAE');

  public instrumentDesc = signal<string>('Digital Pressure Indicator Gauge 0-10,000 PSI');
  public manufacturer = signal<string>('Fluke Calibration');
  public model = signal<string>('700G31');
  public serialNo = signal<string>('SN-78041');
  public partNo = signal<string>('FLK-700G31-01');
  public roTagNo = signal<string>('TAG-PRESS-04');
  public range = signal<string>('0 - 10,000 PSI');
  public accuracy = signal<string>('±0.05% FS');
  public resolution = signal<string>('0.1 PSI');

  public tempVal = signal<string>('23.0');
  public tempUnc = signal<string>('1.2');
  public pressVal = signal<string>('1013.2');
  public pressUnc = signal<string>('1.5');
  public humidityVal = signal<string>('52.0');
  public humidityUnc = signal<string>('4.0');

  public asReceivedCondition = signal<string>('Good / Within Specifications');
  public asLeftCondition = signal<string>('Calibrated / Within Tolerance');
  public statementConformity = signal<string>('Simple Acceptance Rule (EA-4/02)');

  public results = signal<MeasurementResultRow[]>([
    { nominal: '0.00 PSI', asFound: '0.00 PSI', asLeft: '0.00 PSI', error: '0.00%', status: 'PASS' },
    { nominal: '2500.00 PSI', asFound: '2500.80 PSI', asLeft: '2500.10 PSI', error: '+0.004%', status: 'PASS' },
    { nominal: '5000.00 PSI', asFound: '5001.50 PSI', asLeft: '5000.20 PSI', error: '+0.004%', status: 'PASS' },
    { nominal: '7500.00 PSI', asFound: '7502.10 PSI', asLeft: '7500.30 PSI', error: '+0.004%', status: 'PASS' },
    { nominal: '10000.00 PSI', asFound: '10003.50 PSI', asLeft: '10000.50 PSI', error: '+0.005%', status: 'PASS' }
  ]);

  public masterEquipment = signal<MasterEquipRow[]>([
    { description: 'Precision Pressure Calibrator Reference System', srNo: '17011452', model: 'DPI 620-IS', dueDate: '2026-10-21', traceability: 'NPL/01-C631486' },
    { description: 'Digital Reference Thermometer & Barometer', srNo: '54570151', model: 'Fluke 1524', dueDate: '2026-11-03', traceability: '1A Cal Gmbh/01-C633350' }
  ]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.certNo.set(id);
    }
  }

  getQrCodeUrl(id: string): string {
    const targetUrl = window.location.origin + '/certificates/view/' + id;
    return `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(targetUrl)}`;
  }

  printCert() {
    window.print();
  }

  downloadPdf() {
    this.toastService.showInfo('Download PDF Certificate', `Opening Save as PDF for ${this.certNo()}...`);
    window.print();
  }

  closeTab() {
    window.close();
  }
}
