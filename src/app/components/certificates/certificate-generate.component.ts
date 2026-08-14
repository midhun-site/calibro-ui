import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastService } from '../../services/toast.service';

export interface ProcedureItem {
  selected: boolean;
  procedureNumber: string;
  calibrationProcedure: string;
  lab: string;
}

export interface MasterStandardItem {
  selected: boolean;
  description: string;
  srNo: string;
  model: string;
  lab: string;
  dueDate: string;
}

export interface CTRFileItem {
  id: string;
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
}

@Component({
  selector: 'app-certificate-generate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TagModule,
    TableModule
  ],
  templateUrl: './certificate-generate.component.html',
  styleUrl: './certificate-generate.component.css'
})
export class CertificateGenerateComponent {
  private router = inject(Router);
  private toastService = inject(ToastService);

  // Stepper state (1 to 5)
  currentStep = signal<number>(1);

  // Step 1: General & Customer Details
  serviceLocation = signal<string>('Onsite'); // Onsite | Faulty | In-House Lab
  lab = signal<string>('Electrical');
  procedureType = signal<string>('Traceable');
  certNo = signal<string>('CERT-2026-1048');
  issueDate = signal<string>('2026-06-28');
  calibDate = signal<string>('2026-06-28');
  durationVal = signal<number>(1);
  durationUnit = signal<string>('Years');
  dueDate = signal<string>('2027-06-27');
  hideDueDateInCert = signal<boolean>(false);
  woNo = signal<string>('WO-2026-9104');
  totalPages = signal<number>(3);
  asReceivedCondition = signal<string>('Satisfactory');
  asLeftCondition = signal<string>('Calibrated');
  hideCustomerRequestText = signal<boolean>(false);

  // Customer Info
  customerName = signal<string>('Apex Global Energy Solutions LLC');
  customerAddress = signal<string>('P.O. Box 45210, Industrial Zone 4, Sharjah, UAE');
  mName = signal<string>('Energy Operations Division');
  mAddress = signal<string>('Facility A-4, Sharjah Industrial Park, UAE');

  // Step 2: Instrument Details
  instrumentDescription = signal<string>('Relay Testing System');
  manufacturer = signal<string>('CAL-TECH');
  model = signal<string>('CAL-PRO 5000');
  programma = signal<string>('Standard');
  range = signal<string>('0 - 1000 A / 0 - 300 V');
  accuracy = signal<string>('Refer Calibration Results');
  hidePlusMinusAccuracy = signal<boolean>(false);
  resolution = signal<string>('Refer Calibration Results');
  serialNo = signal<string>('SN-780491');
  partNo = signal<string>('PART-904-X');
  roTagNo = signal<string>('TAG-CAL-2026');
  instrIdLabel = signal<string>('Default: Sr No');
  instrIdValue = signal<string>('SrNo');

  // Step 3: Environmental Details
  tempVal = signal<number>(21.2);
  tempUnc = signal<number>(0.3);
  pressVal = signal<number>(1013.2);
  pressUnc = signal<number>(1.5);
  humidityVal = signal<number>(51.2);
  humidityUnc = signal<number>(2.5);
  faultText = signal<string>('');
  observationText = signal<string>('All parameters verified within SI standards. No physical damage observed.');
  recommendationText = signal<string>('Recommended calibration interval: 12 months under standard operating conditions.');

  // Compliance & Decision Rule
  statementConformityBasedOn = signal<string>('Manufacturer specification.');
  decisionRule = signal<string>('Simple acceptance');
  commentsText = signal<string>('The reported expanded uncertainty is based on a standard uncertainty multiplied by coverage factor k=2 providing 95% confidence.');

  // CTR Input Mode ('upload' | 'manual')
  ctrInputMode = signal<'upload' | 'manual'>('upload');

  // CTR Template Selection Options
  selectedCtrTemplate = signal<string>('pressure');
  ctrTemplateOptions = [
    { label: 'Standard Pressure Gauge CTR Raw Data (0 - 10,000 PSI)', value: 'pressure' },
    { label: 'Dry Block Temperature Calibrator CTR Raw Data (-30 to 150°C)', value: 'temperature' },
    { label: 'Digital Multimeter CTR Raw Data (V / A / Ω)', value: 'multimeter' },
    { label: 'Outside Micrometer / Caliper CTR Raw Data (0 - 25mm)', value: 'dimensional' },
    { label: 'Custom Blank CTR Raw Data Template', value: 'blank' }
  ];

  // Manual CTR Editor Content State
  ctrEditorContent = signal<string>(`
<h3 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem;">
  CALIBRATION TEST RESULTS (CTR) & MEASUREMENT DATA SHEET
</h3>
<p style="margin: 6px 0;"><strong>Instrument:</strong> Digital Pressure Gauge 0-10,000 PSI &nbsp;|&nbsp; <strong>Serial No:</strong> SN-78041 &nbsp;|&nbsp; <strong>Tag:</strong> TAG-CAL-2026</p>
<p style="margin: 6px 0 16px 0;"><strong>Environmental Conditions:</strong> Temperature: 23.1 °C &nbsp;|&nbsp; Relative Humidity: 48 %RH &nbsp;|&nbsp; Pressure: 1013 mbar</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; font-size: 13px;">
  <thead>
    <tr style="background-color: #0284c7; color: #ffffff;">
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Nominal Applied (PSI)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Upward Reading (PSI)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Downward Reading (PSI)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Deviation / Error (PSI)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Expanded Uncertainty (±)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">0.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.05 PSI</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">2500.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">2500.2</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">2500.1</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.2</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.08 PSI</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5000.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5000.4</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5000.3</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.4</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.12 PSI</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">7500.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">7500.5</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">7500.4</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.5</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.15 PSI</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10000.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10000.8</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10000.6</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.8</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.18 PSI</td>
    </tr>
  </tbody>
</table>

<p style="margin: 12px 0 6px 0;"><strong>Calibration Result Status:</strong> <span style="background-color: #10b981; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold;">PASSED</span> Within manufacturer tolerance limit of ± 1.0 PSI.</p>
<p style="margin: 6px 0;"><strong>Remarks / Traceability Notes:</strong> Reported expanded uncertainty is calculated using coverage factor k=2 providing ~95% confidence level in accordance with ISO/IEC Guide 98-3 (GUM).</p>
`);

  ctrManualSaved = signal<boolean>(false);

  // CTR File Upload List
  ctrFiles = signal<CTRFileItem[]>([
    {
      id: 'ctr-1',
      fileName: 'CTR_CAL_2026_1048.doc',
      uploadDate: '08/08/2026 11:13:07',
      uploadedBy: 'Alex Rivera'
    }
  ]);

  // Step 4: Sub Lab & Master Selection
  subLab1 = signal<string>('Electrical Calibration Lab 1');
  subLab2 = signal<string>('Secondary Standards Lab');

  // Procedures Table State
  procedureSearch = signal<string>('');
  proceduresList = signal<ProcedureItem[]>([
    { selected: true, procedureNumber: 'CAL-SOP-EC-01 Rev.4', calibrationProcedure: 'Electrical Sourcing Instruments', lab: 'Electrical' },
    { selected: false, procedureNumber: 'CAL-SOP-ET-02 Rev.1', calibrationProcedure: 'Electrode Testing Procedure', lab: 'Electrical' },
    { selected: false, procedureNumber: 'CAL-SOP-FM-03 Rev.2', calibrationProcedure: 'Frequency Meter Calibration', lab: 'Electrical' },
    { selected: true, procedureNumber: 'CAL-SOP-TMP-04 Rev.3', calibrationProcedure: 'Thermal Sensor & RTD Calibration', lab: 'Temperature' },
    { selected: false, procedureNumber: 'CAL-SOP-PRS-05 Rev.2', calibrationProcedure: 'Digital Pressure Gauge Standard', lab: 'Pressure' }
  ]);

  // Master Equipment Table State
  masterSearch = signal<string>('');
  masterEquipmentList = signal<MasterStandardItem[]>([
    { selected: true, description: 'AC/DC Clamp Meter', srNo: 'MS-104928', model: 'CM 4373', lab: 'Electrical', dueDate: '21 Oct 2026' },
    { selected: true, description: 'Digital Multimeter', srNo: 'MS-549012', model: '287', lab: 'Electrical', dueDate: '03 Nov 2026' },
    { selected: false, description: 'AC/DC Multifunction Site Calibrator', srNo: '202008917', model: 'ZMSMFC45', lab: 'Electrical', dueDate: '15 Jan 2027' },
    { selected: true, description: 'Fluke 8508A Reference Multimeter', srNo: '99201411', model: '8508A', lab: 'Electrical', dueDate: '19 Dec 2026' }
  ]);

  // Options Dropdowns
  labOptions = ['Electrical', 'Temperature', 'Pressure', 'Dimensional', 'Mass & Weight'];
  procedureTypeOptions = ['Traceable', 'Accredited (ISO 17025)', 'Standard Commercial'];
  durationUnitOptions = ['Years', 'Months'];
  conditionOptions = ['Satisfactory', 'Unsatisfactory', 'Out of Spec'];
  leftConditionOptions = ['Calibrated', 'Adjusted', 'Repaired', 'Out of Service'];
  statementOptions = ['Manufacturer specification.', 'Customer specification.', 'ISO 17025 Standard requirement.'];
  decisionRuleOptions = ['Simple acceptance', 'Guarded acceptance', 'Non-binary statement'];
  instrIdLabelOptions = ['Default: Sr No', 'Tag No', 'Asset ID'];
  instrIdValueOptions = ['SrNo', 'TagNo', 'AssetID'];

  // Filtered Procedures Computed Signal
  filteredProcedures = computed(() => {
    const q = this.procedureSearch().toLowerCase().trim();
    if (!q) return this.proceduresList();
    return this.proceduresList().filter(p =>
      p.procedureNumber.toLowerCase().includes(q) ||
      p.calibrationProcedure.toLowerCase().includes(q) ||
      p.lab.toLowerCase().includes(q)
    );
  });

  // Filtered Master Equipment Computed Signal
  filteredMasterEquipment = computed(() => {
    const q = this.masterSearch().toLowerCase().trim();
    if (!q) return this.masterEquipmentList();
    return this.masterEquipmentList().filter(m =>
      m.description.toLowerCase().includes(q) ||
      m.srNo.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q) ||
      m.lab.toLowerCase().includes(q)
    );
  });

  // Selected Items Counts Computed
  selectedProceduresCount = computed(() => this.proceduresList().filter(p => p.selected).length);
  selectedMasterCount = computed(() => this.masterEquipmentList().filter(m => m.selected).length);

  // Stepper Actions
  goToStep(step: number) {
    if (step >= 1 && step <= 5) {
      this.currentStep.set(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextStep() {
    if (this.currentStep() < 5) {
      this.goToStep(this.currentStep() + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.goToStep(this.currentStep() - 1);
    }
  }

  // Procedure Check Toggle
  toggleProcedure(proc: ProcedureItem) {
    this.proceduresList.update(list =>
      list.map(p => p.procedureNumber === proc.procedureNumber ? { ...p, selected: !p.selected } : p)
    );
  }

  // Master Check Toggle
  toggleMaster(master: MasterStandardItem) {
    this.masterEquipmentList.update(list =>
      list.map(m => m.srNo === master.srNo ? { ...m, selected: !m.selected } : m)
    );
  }

  // Upload CTR File Mock
  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const newFile: CTRFileItem = {
        id: `ctr-${Date.now()}`,
        fileName: file.name,
        uploadDate: new Date().toLocaleString(),
        uploadedBy: 'Alex Rivera (Metrologist)'
      };
      this.ctrFiles.update(files => [...files, newFile]);
      this.toastService.showSuccess('CTR File Uploaded', `File ${file.name} uploaded successfully.`);
    }
  }

  deleteCtrFile(id: string) {
    this.ctrFiles.update(files => files.filter(f => f.id !== id));
    this.toastService.showInfo('CTR File Removed', 'File deleted from certificate attachments.');
  }

  setCtrInputMode(mode: 'upload' | 'manual') {
    this.ctrInputMode.set(mode);
  }

  execEditorCommand(command: string, value: string | null = null) {
    document.execCommand(command, false, value ?? undefined);
  }

  loadCtrTemplate(templateKey: string) {
    let html = '';
    switch (templateKey) {
      case 'pressure':
        html = `
<h3 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem;">
  CALIBRATION TEST RESULTS (CTR) & MEASUREMENT DATA SHEET
</h3>
<p style="margin: 6px 0;"><strong>Instrument:</strong> Digital Pressure Gauge 0-10,000 PSI &nbsp;|&nbsp; <strong>Serial No:</strong> SN-78041 &nbsp;|&nbsp; <strong>Tag:</strong> TAG-CAL-2026</p>
<p style="margin: 6px 0 16px 0;"><strong>Environmental Conditions:</strong> Temperature: 23.1 °C &nbsp;|&nbsp; Relative Humidity: 48 %RH &nbsp;|&nbsp; Pressure: 1013 mbar</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; font-size: 13px;">
  <thead>
    <tr style="background-color: #0284c7; color: #ffffff;">
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Nominal Applied (PSI)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Upward Reading (PSI)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Downward Reading (PSI)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Deviation / Error (PSI)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">Expanded Uncertainty (±)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">0.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.05 PSI</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">2500.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">2500.2</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">2500.1</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.2</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.08 PSI</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5000.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5000.4</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5000.3</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.4</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.12 PSI</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">7500.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">7500.5</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">7500.4</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.5</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.15 PSI</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10000.0</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10000.8</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10000.6</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.8</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.18 PSI</td>
    </tr>
  </tbody>
</table>

<p style="margin: 12px 0 6px 0;"><strong>Calibration Result Status:</strong> <span style="background-color: #10b981; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold;">PASSED</span> Within manufacturer tolerance limit of ± 1.0 PSI.</p>
<p style="margin: 6px 0;"><strong>Remarks / Traceability Notes:</strong> Reported expanded uncertainty is calculated using coverage factor k=2 providing ~95% confidence level in accordance with ISO/IEC Guide 98-3 (GUM).</p>
`;
        break;
      case 'temperature':
        html = `
<h3 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem;">
  CALIBRATION TEST RESULTS (CTR) & MEASUREMENT DATA SHEET
</h3>
<p style="margin: 6px 0;"><strong>Instrument:</strong> Dry Block Temperature Calibrator (-30 to 150°C) &nbsp;|&nbsp; <strong>Serial No:</strong> SN-99420</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; font-size: 13px;">
  <thead>
    <tr style="background-color: #0284c7; color: #ffffff;">
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Nominal Setpoint (°C)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Master Ref Temp (°C)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">UUT Indicated (°C)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Error (°C)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Uncertainty (±)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">-30.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">-30.02</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">-30.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.02</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.04 °C</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">-0.01</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.01</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.03 °C</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">50.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">50.01</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">50.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">-0.01</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.03 °C</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">100.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">100.03</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">100.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">-0.03</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.05 °C</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">150.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">150.05</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">150.00</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">-0.05</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.06 °C</td>
    </tr>
  </tbody>
</table>
<p style="margin: 12px 0 6px 0;"><strong>Compliance:</strong> <span style="background-color: #10b981; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold;">PASSED</span></p>
`;
        break;
      case 'multimeter':
        html = `
<h3 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem;">
  CALIBRATION TEST RESULTS (CTR) & MEASUREMENT DATA SHEET
</h3>
<p style="margin: 6px 0;"><strong>Instrument:</strong> 6.5 Digit Precision Multimeter &nbsp;|&nbsp; <strong>Range:</strong> 10 V DC</p>
<table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; font-size: 13px;">
  <thead>
    <tr style="background-color: #0284c7; color: #ffffff;">
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Applied Standard (V)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">UUT Measured (V)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Deviation (mV)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Spec Limit</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">1.000000 V</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">1.000002 V</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.002 mV</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">±0.035 mV</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">PASS</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5.000000 V</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5.000008 V</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.008 mV</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">±0.150 mV</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">PASS</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10.000000 V</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10.000015 V</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.015 mV</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">±0.300 mV</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">PASS</td>
    </tr>
  </tbody>
</table>
`;
        break;
      case 'dimensional':
        html = `
<h3 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem;">
  CALIBRATION TEST RESULTS (CTR) & MEASUREMENT DATA SHEET
</h3>
<p style="margin: 6px 0;"><strong>Instrument:</strong> Outside Vernier Micrometer 0-25mm &nbsp;|&nbsp; <strong>Serial No:</strong> SN-11029</p>
<table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; font-size: 13px;">
  <thead>
    <tr style="background-color: #0284c7; color: #ffffff;">
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Nominal Gauge Block (mm)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">UUT Measured (mm)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Error (mm)</th>
      <th style="padding: 10px 12px; border: 1px solid #cbd5e1;">Max Permissible Error</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.000 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">0.000 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">0.000 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">± 0.002 mm</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5.100 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">5.101 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.001 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">± 0.002 mm</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10.300 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">10.301 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.001 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">± 0.002 mm</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">25.000 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">25.002 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981; font-weight: bold;">+0.002 mm</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">± 0.002 mm</td>
    </tr>
  </tbody>
</table>
`;
        break;
      default:
        html = `
<h3 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem;">
  CALIBRATION TEST RESULTS (CTR) & MEASUREMENT DATA SHEET
</h3>
<p style="margin: 6px 0;">Enter custom raw calibration measurements, tables, errors, and notes here...</p>
`;
        break;
    }
    this.ctrEditorContent.set(html);
  }

  onTemplateChange(event: any) {
    const val = event.target ? event.target.value : event;
    this.selectedCtrTemplate.set(val);
    this.loadCtrTemplate(val);
  }

  openUncertaintyCalculator() {
    window.open('/qc/uncertainty-calculator', '_blank');
  }

  saveManualCtr() {
    const budgetHtml = localStorage.getItem('calibro_uncertainty_budget_html');
    if (budgetHtml) {
      this.ctrEditorContent.set(budgetHtml);
    }
    this.ctrManualSaved.set(true);
    this.toastService.showSuccess('Manual CTR Saved', 'CTR template values saved successfully for this certificate.');
  }

  saveDraft() {
    this.toastService.showSuccess('Draft Saved', `Certificate draft ${this.certNo()} saved successfully.`);
  }

  getQrCodeUrl(id: string): string {
    const certId = id || 'CERT-2026-1048';
    const targetUrl = window.location.origin + '/certificates/view/' + certId;
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(targetUrl)}`;
  }

  submitCertificate() {
    this.toastService.showSuccess(
      'Certificate Generated!',
      `Certificate ${this.certNo()} for ${this.customerName()} has been generated and published.`
    );
    setTimeout(() => {
      this.router.navigate(['/certificates']);
    }, 1200);
  }
}
