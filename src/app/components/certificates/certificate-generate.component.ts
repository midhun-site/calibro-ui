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
  certNo = signal<string>('01-OC568648');
  issueDate = signal<string>('2026-06-28');
  calibDate = signal<string>('2026-06-28');
  durationVal = signal<number>(1);
  durationUnit = signal<string>('Years');
  dueDate = signal<string>('2027-06-27');
  hideDueDateInCert = signal<boolean>(false);
  woNo = signal<string>('WA151108');
  totalPages = signal<number>(3);
  asReceivedCondition = signal<string>('Satisfactory');
  asLeftCondition = signal<string>('Calibrated');
  hideCustomerRequestText = signal<boolean>(false);

  // Customer Info
  customerName = signal<string>('Servizi Energia Italia S.p.A');
  customerAddress = signal<string>('P.B No: 03843480272, Via Martiri Di Cefalonia 67, Registro Delle Imprese');
  mName = signal<string>('Azule-Energy');
  mAddress = signal<string>('Via Martiri Di Cefalonia 67, Registro Delle Imprese Di Milano, Others, Italy');

  // Step 2: Instrument Details
  instrumentDescription = signal<string>('Relay Test System');
  manufacturer = signal<string>('FREJA');
  model = signal<string>('FREJA 300');
  programma = signal<string>('Different');
  range = signal<string>('0 - 1000 A / 0 - 300 V');
  accuracy = signal<string>('Refer calibration results');
  hidePlusMinusAccuracy = signal<boolean>(false);
  resolution = signal<string>('Refer Calibration Results');
  serialNo = signal<string>('5501452');
  partNo = signal<string>('P-8829-X');
  roTagNo = signal<string>('TAG-2026-99');
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

  // CTR File Upload List
  ctrFiles = signal<CTRFileItem[]>([
    {
      id: 'ctr-1',
      fileName: '568648_CTR_10367627_1.doc',
      uploadDate: '08/08/2026 11:13:07',
      uploadedBy: 'Smitha Gopalakrishnan Nair'
    }
  ]);

  // Step 4: Sub Lab & Master Selection
  subLab1 = signal<string>('Electrical Calibration Lab 1');
  subLab2 = signal<string>('Secondary Standards Lab');

  // Procedures Table State
  procedureSearch = signal<string>('');
  proceduresList = signal<ProcedureItem[]>([
    { selected: true, procedureNumber: 'CI/01/EC1 Rev.7', calibrationProcedure: 'Electrical Sourcing Instruments', lab: 'Electrical' },
    { selected: false, procedureNumber: 'CI/01/ET1 Rev.0', calibrationProcedure: 'Electrode Testing Procedure', lab: 'Electrical' },
    { selected: false, procedureNumber: 'CI/01/F1 Rev.3', calibrationProcedure: 'Frequency Meter Calibration', lab: 'Electrical' },
    { selected: true, procedureNumber: 'CI/02/TEMP Rev.2', calibrationProcedure: 'Thermal Sensor & RTD Calibration', lab: 'Temperature' },
    { selected: false, procedureNumber: 'CI/03/PRESS Rev.5', calibrationProcedure: 'Digital Pressure Gauge Standard', lab: 'Pressure' }
  ]);

  // Master Equipment Table State
  masterSearch = signal<string>('');
  masterEquipmentList = signal<MasterStandardItem[]>([
    { selected: true, description: 'AC/DC Clamp Meter', srNo: '170114552', model: 'CM 4373', lab: 'Electrical', dueDate: '21 Oct 2026' },
    { selected: true, description: 'Digital Multimeter', srNo: '54570151', model: '287', lab: 'Electrical', dueDate: '03 Nov 2026' },
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

  saveDraft() {
    this.toastService.showSuccess('Draft Saved', `Certificate draft ${this.certNo()} saved successfully.`);
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
