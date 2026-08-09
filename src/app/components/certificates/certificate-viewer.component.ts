import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-certificate-viewer',
  standalone: true,
  imports: [CommonModule, TagModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Calibration Certificate Viewer</h2>
          <p class="subtitle">ISO/IEC 17025 Compliant Official Test Certificate</p>
        </div>
        <button class="btn-primary" (click)="printCert()">
          <i class="pi pi-print"></i> Print / Download PDF
        </button>
      </div>

      <!-- Certificate Document Mockup -->
      <div class="glass-card cert-paper">
        <div class="cert-header">
          <div class="cert-brand">
            <div class="cert-logo-icon"><i class="pi pi-compass text-cyan"></i></div>
            <div>
              <h2>CaliBro Calibration Services</h2>
              <p>Accredited ISO/IEC 17025 Laboratory | Certificate No: <strong>CERT-2026-8891</strong></p>
            </div>
          </div>
          <div class="cert-seal">
            <p-tag value="PASSED" severity="success"></p-tag>
          </div>
        </div>

        <hr class="cert-divider" />

        <div class="cert-details-grid">
          <div class="detail-box">
            <span class="detail-label">Customer Name</span>
            <span class="detail-val">AeroSpace Tech LLC</span>
          </div>
          <div class="detail-box">
            <span class="detail-label">Instrument Name</span>
            <span class="detail-val">Digital Pressure Gauge 0-1000 PSI</span>
          </div>
          <div class="detail-box">
            <span class="detail-label">Manufacturer / Model</span>
            <span class="detail-val">Fluke Calibration (700G08)</span>
          </div>
          <div class="detail-box">
            <span class="detail-label">Serial Number / Asset Tag</span>
            <span class="detail-val">FLK-98741 (EQ-PRES-001)</span>
          </div>
          <div class="detail-box">
            <span class="detail-label">Calibration Date</span>
            <span class="detail-val">August 8, 2026</span>
          </div>
          <div class="detail-box">
            <span class="detail-label">Next Recalibration Due</span>
            <span class="detail-val text-cyan">August 8, 2027</span>
          </div>
          <div class="detail-box">
            <span class="detail-label">Ambient Conditions</span>
            <span class="detail-val">22.5°C | 48.2% RH</span>
          </div>
          <div class="detail-box">
            <span class="detail-label">Expanded Uncertainty</span>
            <span class="detail-val">±0.025 PSI (k=2, 95% Conf.)</span>
          </div>
        </div>

        <h3 class="mt-4 mb-2"><i class="pi pi-list-check text-cyan"></i> Calibration Measurement Results</h3>
        <table class="test-table">
          <thead>
            <tr>
              <th>Nominal Value (PSI)</th>
              <th>As-Found Reading (PSI)</th>
              <th>As-Left Reading (PSI)</th>
              <th>Instrument Error (%)</th>
              <th>Pass / Fail</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0.00</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>0.00%</td>
              <td><span class="badge-pass">PASS</span></td>
            </tr>
            <tr>
              <td>250.00</td>
              <td>250.05</td>
              <td>250.01</td>
              <td>+0.004%</td>
              <td><span class="badge-pass">PASS</span></td>
            </tr>
            <tr>
              <td>500.00</td>
              <td>500.12</td>
              <td>500.02</td>
              <td>+0.004%</td>
              <td><span class="badge-pass">PASS</span></td>
            </tr>
            <tr>
              <td>1000.00</td>
              <td>1000.25</td>
              <td>1000.05</td>
              <td>+0.005%</td>
              <td><span class="badge-pass">PASS</span></td>
            </tr>
          </tbody>
        </table>

        <div class="cert-signatures">
          <div class="sig-box">
            <span class="sig-title">Performed By Metrologist</span>
            <span class="sig-name">Alex Rivera</span>
            <span class="sig-date">Aug 08, 2026</span>
          </div>
          <div class="sig-box">
            <span class="sig-title">Quality Manager Approval</span>
            <span class="sig-name">Dr. Marcus Vance</span>
            <span class="sig-date">Aug 08, 2026</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .subtitle { color: var(--text-muted); }
    .btn-primary {
      background: var(--accent-gradient); border: none; color: #000; font-weight: 700;
      padding: 0.75rem 1.25rem; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
    }
    .cert-paper { padding: 2.5rem; border: 1px solid var(--border-color); background: rgba(17, 24, 39, 0.85); }
    .cert-header { display: flex; justify-content: space-between; align-items: center; }
    .cert-brand { display: flex; align-items: center; gap: 1rem; }
    .cert-logo-icon { width: 50px; height: 50px; border-radius: 12px; background: rgba(0,242,254,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
    .cert-divider { border: 0; height: 1px; background: var(--border-color); margin: 1.5rem 0; }
    .cert-details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
    .detail-box { display: flex; flex-direction: column; gap: 0.2rem; background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); }
    .detail-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
    .detail-val { font-weight: 600; font-size: 0.95rem; }
    .test-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .test-table th, .test-table td { padding: 0.85rem; text-align: left; border-bottom: 1px solid var(--border-color); }
    .test-table th { background: rgba(255,255,255,0.05); color: var(--text-muted); font-size: 0.85rem; }
    .badge-pass { background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem; }
    .cert-signatures { display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-color); }
    .sig-box { display: flex; flex-direction: column; gap: 0.2rem; }
    .sig-title { font-size: 0.8rem; color: var(--text-muted); }
    .sig-name { font-weight: 700; font-size: 1.1rem; color: var(--accent-cyan); }
    .sig-date { font-size: 0.75rem; color: var(--text-muted); }
    .mt-4 { margin-top: 1.5rem; }
    .mb-2 { margin-bottom: 0.5rem; }
  `]
})
export class CertificateViewerComponent {
  printCert() {
    window.print();
  }
}
