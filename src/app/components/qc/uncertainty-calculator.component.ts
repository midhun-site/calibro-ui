import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

export interface TypeBComponent {
  source: string;
  value: number;
  unit: string;
  distribution: 'Normal (k=2)' | 'Rectangular (√3)' | 'Triangular (√6)';
  divisor: number;
  sensitivityCoeff: number;
  standardUncertainty: number;
  degreesOfFreedom: number;
}

@Component({
  selector: 'app-uncertainty-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './uncertainty-calculator.component.html',
  styleUrl: './uncertainty-calculator.component.css'
})
export class UncertaintyCalculatorComponent {
  private toastService = inject(ToastService);

  // Document Title & Preset Selection
  docTitle = signal<string>('ISO 17025 Uncertainty Budget Calculator Sheet');
  selectedPreset = signal<string>('pressure');

  // Active Cell Selection for Formula Bar
  activeCell = signal<string>('B4');
  formulaInput = signal<string>('=AVERAGE(B4:B8)');

  // Type A Statistical Data (5 Runs)
  unitName = signal<string>('PSI');
  run1 = signal<number>(2500.1);
  run2 = signal<number>(2500.2);
  run3 = signal<number>(2500.1);
  run4 = signal<number>(2500.3);
  run5 = signal<number>(2500.2);

  // Computed Type A Metrics
  meanValue = computed(() => {
    const runs = [this.run1(), this.run2(), this.run3(), this.run4(), this.run5()];
    const sum = runs.reduce((a, b) => a + b, 0);
    return Number((sum / runs.length).toFixed(4));
  });

  stdDev = computed(() => {
    const runs = [this.run1(), this.run2(), this.run3(), this.run4(), this.run5()];
    const m = this.meanValue();
    const variance = runs.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / (runs.length - 1);
    return Number(Math.sqrt(variance).toFixed(5));
  });

  typeAUncertainty = computed(() => {
    const s = this.stdDev();
    // u_A = s(x) / sqrt(5)
    return Number((s / Math.sqrt(5)).toFixed(5));
  });

  // Type B Uncertainty Components
  typeBList = signal<TypeBComponent[]>([
    {
      source: 'Calibration Master Equipment Uncertainty',
      value: 0.10,
      unit: 'PSI',
      distribution: 'Normal (k=2)',
      divisor: 2.00,
      sensitivityCoeff: 1.0,
      standardUncertainty: 0.050,
      degreesOfFreedom: 50
    },
    {
      source: 'Resolution / Digital Least Count',
      value: 0.10,
      unit: 'PSI',
      distribution: 'Rectangular (√3)',
      divisor: 1.732,
      sensitivityCoeff: 1.0,
      standardUncertainty: 0.0289,
      degreesOfFreedom: 100
    },
    {
      source: 'Environmental Temperature Fluctuation',
      value: 0.05,
      unit: 'PSI',
      distribution: 'Rectangular (√3)',
      divisor: 1.732,
      sensitivityCoeff: 1.0,
      standardUncertainty: 0.0144,
      degreesOfFreedom: 50
    },
    {
      source: 'Hysteresis & Repeatability Limit',
      value: 0.08,
      unit: 'PSI',
      distribution: 'Rectangular (√3)',
      divisor: 1.732,
      sensitivityCoeff: 1.0,
      standardUncertainty: 0.0231,
      degreesOfFreedom: 50
    }
  ]);

  // Combined Standard Uncertainty u_c
  combinedUncertainty = computed(() => {
    const uA = this.typeAUncertainty();
    const sumTypeBSq = this.typeBList().reduce((sum, item) => {
      const uB = item.value / item.divisor;
      return sum + Math.pow(uB * item.sensitivityCoeff, 2);
    }, 0);
    return Number(Math.sqrt(Math.pow(uA, 2) + sumTypeBSq).toFixed(5));
  });

  // Coverage Factor k = 2.00
  coverageFactor = signal<number>(2.00);

  // Expanded Uncertainty U = k * u_c
  expandedUncertainty = computed(() => {
    return Number((this.combinedUncertainty() * this.coverageFactor()).toFixed(4));
  });

  // Welch-Satterthwaite Effective Degrees of Freedom
  effectiveDOF = computed(() => {
    const uc = this.combinedUncertainty();
    const uA = this.typeAUncertainty();
    const termA = Math.pow(uA, 4) / 4; // n-1 = 4
    const termB = this.typeBList().reduce((sum, item) => {
      const uB = item.value / item.divisor;
      return sum + (Math.pow(uB, 4) / item.degreesOfFreedom);
    }, 0);

    const totalDenominator = termA + termB;
    if (totalDenominator <= 0) return 999;
    return Math.round(Math.pow(uc, 4) / totalDenominator);
  });

  loadPreset(presetKey: string) {
    this.selectedPreset.set(presetKey);
    switch (presetKey) {
      case 'pressure':
        this.docTitle.set('ISO 17025 Uncertainty Budget Sheet - Digital Pressure Gauge 0-10,000 PSI');
        this.unitName.set('PSI');
        this.run1.set(2500.1); this.run2.set(2500.2); this.run3.set(2500.1); this.run4.set(2500.3); this.run5.set(2500.2);
        this.typeBList.set([
          { source: 'Master Reference Calibrator', value: 0.10, unit: 'PSI', distribution: 'Normal (k=2)', divisor: 2.0, sensitivityCoeff: 1.0, standardUncertainty: 0.05, degreesOfFreedom: 50 },
          { source: 'UUT Resolution / Least Count', value: 0.10, unit: 'PSI', distribution: 'Rectangular (√3)', divisor: 1.732, sensitivityCoeff: 1.0, standardUncertainty: 0.0289, degreesOfFreedom: 100 },
          { source: 'Ambient Temperature Stability', value: 0.05, unit: 'PSI', distribution: 'Rectangular (√3)', divisor: 1.732, sensitivityCoeff: 1.0, standardUncertainty: 0.0144, degreesOfFreedom: 50 },
          { source: 'Hysteresis & Repeatability', value: 0.08, unit: 'PSI', distribution: 'Rectangular (√3)', divisor: 1.732, sensitivityCoeff: 1.0, standardUncertainty: 0.0231, degreesOfFreedom: 50 }
        ]);
        break;
      case 'temperature':
        this.docTitle.set('ISO 17025 Uncertainty Budget Sheet - Dry Block Temp Calibrator (-30 to 150°C)');
        this.unitName.set('°C');
        this.run1.set(100.01); this.run2.set(100.03); this.run3.set(100.02); this.run4.set(100.01); this.run5.set(100.02);
        this.typeBList.set([
          { source: 'PRT Master Reference Sensor', value: 0.025, unit: '°C', distribution: 'Normal (k=2)', divisor: 2.0, sensitivityCoeff: 1.0, standardUncertainty: 0.0125, degreesOfFreedom: 50 },
          { source: 'Dry Block Axial Uniformity', value: 0.030, unit: '°C', distribution: 'Rectangular (√3)', divisor: 1.732, sensitivityCoeff: 1.0, standardUncertainty: 0.0173, degreesOfFreedom: 50 },
          { source: 'Display Resolution (0.01°C)', value: 0.010, unit: '°C', distribution: 'Rectangular (√3)', divisor: 1.732, sensitivityCoeff: 1.0, standardUncertainty: 0.0058, degreesOfFreedom: 100 }
        ]);
        break;
      case 'multimeter':
        this.docTitle.set('ISO 17025 Uncertainty Budget Sheet - 6.5 Digit Precision Multimeter (10V DC)');
        this.unitName.set('mV');
        this.run1.set(10.00001); this.run2.set(10.00003); this.run3.set(10.00002); this.run4.set(10.00001); this.run5.set(10.00002);
        this.typeBList.set([
          { source: 'Fluke 5720A Calibrator Standard', value: 0.0035, unit: 'mV', distribution: 'Normal (k=2)', divisor: 2.0, sensitivityCoeff: 1.0, standardUncertainty: 0.00175, degreesOfFreedom: 50 },
          { source: 'Multimeter 24h Stability Spec', value: 0.0020, unit: 'mV', distribution: 'Rectangular (√3)', divisor: 1.732, sensitivityCoeff: 1.0, standardUncertainty: 0.00115, degreesOfFreedom: 50 }
        ]);
        break;
      case 'dimensional':
        this.docTitle.set('ISO 17025 Uncertainty Budget Sheet - Vernier Micrometer 0-25mm');
        this.unitName.set('mm');
        this.run1.set(25.001); this.run2.set(25.002); this.run3.set(25.001); this.run4.set(25.002); this.run5.set(25.001);
        this.typeBList.set([
          { source: 'Grade 0 Gauge Block Set', value: 0.0010, unit: 'mm', distribution: 'Normal (k=2)', divisor: 2.0, sensitivityCoeff: 1.0, standardUncertainty: 0.0005, degreesOfFreedom: 50 },
          { source: 'Micrometer Thimble Scale Res', value: 0.0010, unit: 'mm', distribution: 'Rectangular (√3)', divisor: 1.732, sensitivityCoeff: 1.0, standardUncertainty: 0.00058, degreesOfFreedom: 100 }
        ]);
        break;
    }
    this.toastService.showSuccess('Preset Template Loaded', `Loaded ISO 17025 Budget for ${presetKey.toUpperCase()}`);
  }

  selectCell(cell: string, formula: string) {
    this.activeCell.set(cell);
    this.formulaInput.set(formula);
  }

  applyToCtrEditor() {
    const formattedHtml = `
<div style="font-family: Arial, sans-serif;">
  <h4 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 4px; margin-top: 0;">
    ISO/IEC 17025 UNCERTAINTY BUDGET EVALUATION SUMMARY SHEET
  </h4>
  <p><strong>Calculated Mean (x̄):</strong> ${this.meanValue()} ${this.unitName()} | <strong>Standard Deviation s(x):</strong> ${this.stdDev()} ${this.unitName()}</p>
  <p><strong>Combined Standard Uncertainty (u_c):</strong> ± ${this.combinedUncertainty()} ${this.unitName()} | <strong>Coverage Factor (k):</strong> 2.00 (95.45% Confidence Level)</p>
  <p style="font-size: 14px;"><strong>REPORTED EXPANDED UNCERTAINTY (U):</strong> <span style="background-color: #0284c7; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: bold;">± ${this.expandedUncertainty()} ${this.unitName()}</span></p>
  
  <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px;">
    <thead>
      <tr style="background-color: #0284c7; color: #ffffff;">
        <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">Uncertainty Source</th>
        <th style="padding: 6px; border: 1px solid #cbd5e1;">Value</th>
        <th style="padding: 6px; border: 1px solid #cbd5e1;">Distribution</th>
        <th style="padding: 6px; border: 1px solid #cbd5e1;">Divisor</th>
        <th style="padding: 6px; border: 1px solid #cbd5e1;">Std Uncertainty u(x_i)</th>
        <th style="padding: 6px; border: 1px solid #cbd5e1;">v_eff</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 6px; border: 1px solid #cbd5e1;">Repeatability (Type A)</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${this.stdDev()} ${this.unitName()}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">Normal (√5)</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">2.236</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${this.typeAUncertainty()} ${this.unitName()}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">4</td>
      </tr>
      ${this.typeBList().map(b => `
      <tr>
        <td style="padding: 6px; border: 1px solid #cbd5e1;">${b.source}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${b.value} ${b.unit}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${b.distribution}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${b.divisor}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${(b.value / b.divisor).toFixed(5)} ${b.unit}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${b.degreesOfFreedom}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</div>`;

    localStorage.setItem('calibro_uncertainty_budget_html', formattedHtml);
    this.toastService.showSuccess('Budget Transferred!', 'ISO 17025 Uncertainty Budget copied & saved for Certificate Page 2.');
  }

  exportCsv() {
    this.toastService.showInfo('CSV Export', 'Exporting spreadsheet budget rows to CSV file...');
  }

  closeTab() {
    window.close();
  }
}
