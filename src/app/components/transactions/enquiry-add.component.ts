import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

export interface EnquiryItemRow {
  slNo: number;
  itemName: string;
  serialNo: string;
  roTagNo: string;
  make: string;
  model: string;
  range: string;
  qty: number;
}

@Component({
  selector: 'app-enquiry-add',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './enquiry-add.component.html',
  styleUrl: './enquiry-add.component.css'
})
export class EnquiryAddComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  public isEditMode = false;

  public enquiry = {
    enqNo: '',
    mode: 'Mail',
    nature: 'Calibration (CAL)',
    client: '',
    address: '',
    poBox: '',
    contactPerson: '',
    email: '',
    enqDate: '',
    reference: '',
    forTcp: false,
    telNo: '',
    fax: '',
    designation: '',
    department: '',
    revNo: '00',
    status: 'Draft',
    revDate: ''
  };

  public items: EnquiryItemRow[] = [];

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.enquiry.enqNo = id;
      this.enquiry.enqDate = today;
      this.enquiry.revDate = today;
      this.enquiry.client = 'EMARAT ALOULA CONTRACTING CO';
      this.onClientChange();
      this.items = [
        { slNo: 1, itemName: '4-Gas Personal Monitor (H2S/CO/O2/LEL)', serialNo: 'SN-99120', roTagNo: 'TAG-GAS-01', make: 'Honeywell', model: 'BW MAX XT II', range: '0-100 PPM / 0-25% VOL', qty: 2 },
        { slNo: 2, itemName: 'Digital Pressure Indicator Gauge', serialNo: 'SN-78041', roTagNo: 'TAG-PRESS-04', make: 'Fluke Calibration', model: '700G31', range: '0 - 10,000 PSI', qty: 1 }
      ];
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      this.enquiry.enqNo = `ENQ-${new Date().getFullYear()}-${randomNum}`;
      this.enquiry.enqDate = today;
      this.enquiry.revDate = today;
      this.items = [
        {
          slNo: 1,
          itemName: '',
          serialNo: '',
          roTagNo: '',
          make: '',
          model: '',
          range: '',
          qty: 1
        }
      ];
    }
  }

  onClientChange() {
    if (this.enquiry.client === 'EMARAT ALOULA CONTRACTING CO') {
      this.enquiry.address = 'Industrial City Of Abu Dhabi 3, Abu Dhabi, United Arab Emirates';
      this.enquiry.poBox = '26831';
      this.enquiry.contactPerson = 'Ameer Abbaz Moideenkut';
      this.enquiry.email = 'ameer.moideenkut@emarataloula.com';
      this.enquiry.telNo = '971.25130513';
      this.enquiry.fax = '971.25130519';
      this.enquiry.designation = 'QA/QC Manager';
      this.enquiry.department = 'Metrology Dept';
    } else if (this.enquiry.client === 'AeroSpace Tech LLC') {
      this.enquiry.address = 'Aviation Zone 4, Dubai World Central, UAE';
      this.enquiry.poBox = '12040';
      this.enquiry.contactPerson = 'Capt. David Miller';
      this.enquiry.email = 'd.miller@aerospacetech.ae';
      this.enquiry.telNo = '971.48891234';
      this.enquiry.fax = '971.48891235';
      this.enquiry.designation = 'Chief Metrologist';
      this.enquiry.department = 'Avionics Lab';
    } else if (this.enquiry.client === 'BioPharm Solutions') {
      this.enquiry.address = 'Healthcare City, Building 6, Dubai, UAE';
      this.enquiry.poBox = '55401';
      this.enquiry.contactPerson = 'Dr. Elena Rostova';
      this.enquiry.email = 'elena.rostova@biopharm.com';
      this.enquiry.telNo = '971.43679000';
      this.enquiry.fax = '971.43679001';
      this.enquiry.designation = 'Quality Director';
      this.enquiry.department = 'QC Laboratory';
    } else {
      // Clear fields if custom or unselected
      this.enquiry.address = '';
      this.enquiry.poBox = '';
      this.enquiry.contactPerson = '';
      this.enquiry.email = '';
      this.enquiry.telNo = '';
      this.enquiry.fax = '';
      this.enquiry.designation = '';
      this.enquiry.department = '';
    }
  }

  addItemRow() {
    const newSlNo = this.items.length + 1;
    this.items.push({
      slNo: newSlNo,
      itemName: '',
      serialNo: '',
      roTagNo: '',
      make: '',
      model: '',
      range: '',
      qty: 1
    });
  }

  removeItemRow(index: number) {
    if (this.items.length <= 1) {
      this.toastService.showWarning('Items Required', 'Enquiry must contain at least 1 item.');
      return;
    }
    this.items.splice(index, 1);
  }

  saveEnquiry() {
    if (!this.enquiry.client) {
      this.toastService.showWarning('Client Required', 'Please select or enter a client.');
      return;
    }
    this.toastService.showSuccess('Enquiry Created', `Calibration Enquiry ${this.enquiry.enqNo} saved successfully with ${this.items.length} item(s).`);
    this.router.navigate(['/transactions/enquiry']);
  }

  printEnquiry() {
    window.open('/transactions/enquiry/print/' + this.enquiry.enqNo, '_blank');
  }

  goBack() {
    this.router.navigate(['/transactions/enquiry']);
  }
}
