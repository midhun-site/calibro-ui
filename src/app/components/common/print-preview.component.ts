import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';

export interface PrintItem {
  slNo: number;
  itemName: string;
  serialNo: string;
  roTagNo: string;
  make: string;
  model: string;
  range: string;
  qty: number;
  unitPrice?: string;
  totalPrice?: string;
}

export interface PrintMetadataRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-print-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print-preview.component.html',
  styleUrl: './print-preview.component.css'
})
export class PrintPreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  public docType = signal<string>('enquiry'); // enquiry, quotation, workorder, certificate, delivery-in, delivery-ticket, invoice
  public docId = signal<string>('DOC-2026-001');

  public documentTitle = signal<string>('CUSTOMER ENQUIRY & FEASIBILITY SPECIFICATION');
  public badgeText = signal<string>('ENQUIRY PREVIEW');

  public metadataLeft = signal<PrintMetadataRow[]>([]);
  public metadataRight = signal<PrintMetadataRow[]>([]);
  public items = signal<PrintItem[]>([]);
  public notes = signal<string[]>([]);
  public footerSignatures = signal<{ title: string; name: string; subtitle?: string }[]>([]);

  ngOnInit() {
    // Read route params: supports /print-preview/:type/:id or /transactions/:type/print/:id
    const typeParam = (this.route.snapshot.paramMap.get('type') || 'enquiry').toLowerCase();
    const idParam = this.route.snapshot.paramMap.get('id') || 'ENQ-2026-081';

    this.docType.set(typeParam);
    this.docId.set(idParam);

    this.loadDocumentData(typeParam, idParam);
  }

  loadDocumentData(type: string, id: string) {
    if (type.includes('quote') || type.includes('quotation')) {
      this.setupQuotationDoc(id);
    } else if (type.includes('workorder') || type.includes('job')) {
      this.setupWorkorderDoc(id);
    } else if (type.includes('cert') || type.includes('certificate')) {
      this.setupCertificateDoc(id);
    } else if (type.includes('ticket') || type.includes('dispatch') || type.includes('delivery-ticket')) {
      this.setupDeliveryTicketDoc(id);
    } else if (type.includes('invoice') || type.includes('bill')) {
      this.setupInvoiceDoc(id);
    } else if (type.includes('delivery-in') || type.includes('intake')) {
      this.setupDeliveryInDoc(id);
    } else {
      // Default: Customer Enquiry
      this.setupEnquiryDoc(id);
    }
  }

  setupEnquiryDoc(id: string) {
    this.documentTitle.set('CUSTOMER ENQUIRY & TECHNICAL FEASIBILITY SPECIFICATION');
    this.badgeText.set('ENQUIRY PREVIEW');

    this.metadataLeft.set([
      { label: 'Enquiry Reference:', value: id },
      { label: 'Client Company:', value: 'EMARAT ALOULA CONTRACTING CO' },
      { label: 'Client Address:', value: 'Industrial City Of Abu Dhabi 3, Abu Dhabi, UAE' },
      { label: 'P.O. Box:', value: '26831' },
      { label: 'Contact Person:', value: 'Ameer Abbaz Moideenkut' },
      { label: 'Designation / Dept:', value: 'QA/QC Manager (Metrology Dept)' }
    ]);

    this.metadataRight.set([
      { label: 'Enquiry Date:', value: new Date().toISOString().split('T')[0] },
      { label: 'Revision No:', value: '00 (Rev Date: ' + new Date().toISOString().split('T')[0] + ')' },
      { label: 'Mode of Intake:', value: 'Mail' },
      { label: 'Nature of Service:', value: 'Calibration (CAL)' },
      { label: 'Client Reference:', value: 'REF-EA-2026-904' },
      { label: 'Telephone / Fax:', value: '+971 2 5130513 / +971 2 5130519' }
    ]);

    this.items.set([
      { slNo: 1, itemName: '4-Gas Personal Monitor (H2S/CO/O2/LEL)', serialNo: 'SN-99120', roTagNo: 'TAG-GAS-01', make: 'Honeywell', model: 'BW MAX XT II', range: '0-100 PPM / 0-25% VOL', qty: 2 },
      { slNo: 2, itemName: 'Digital Pressure Indicator Gauge', serialNo: 'SN-78041', roTagNo: 'TAG-PRESS-04', make: 'Fluke Calibration', model: '700G31', range: '0 - 10,000 PSI', qty: 1 },
      { slNo: 3, itemName: 'Precision Temperature Calibrator Bath', serialNo: 'SN-54902', roTagNo: 'TAG-TEMP-02', make: 'Isotech', model: 'Jupiter 650', range: '-35°C to +650°C', qty: 1 }
    ]);

    this.notes.set([
      '1. Laboratory possesses adequate accredited scope and technical capability for all requested instruments.',
      '2. Environmental conditions during calibration: Temperature (23°C ± 2°C), Relative Humidity (50% ± 10% RH).',
      '3. Calibration results will be traceable to SI Units via international measurement standards (NPL/EMI/NIST).'
    ]);

    this.footerSignatures.set([
      { title: 'Customer Representative Signature', name: 'Ameer Abbaz Moideenkut', subtitle: 'QA/QC Manager' },
      { title: 'Received By Laboratory Metrologist', name: 'Alex Rivera (Senior Metrologist)', subtitle: 'CaliBro Calibration Laboratories' }
    ]);
  }

  setupQuotationDoc(id: string) {
    this.documentTitle.set('COMMERCIAL CALIBRATION QUOTATION PROPOSAL');
    this.badgeText.set('QUOTATION PREVIEW');

    this.metadataLeft.set([
      { label: 'Quotation No:', value: id },
      { label: 'Enquiry Ref:', value: 'ENQ-2026-081' },
      { label: 'Customer Name:', value: 'Apex Global Energy Solutions LLC' },
      { label: 'Address:', value: 'P.O. Box 45210, Industrial Zone 4, Sharjah, UAE' },
      { label: 'Attention:', value: 'Mr. David Miller (Maintenance Lead)' }
    ]);

    this.metadataRight.set([
      { label: 'Quotation Date:', value: new Date().toISOString().split('T')[0] },
      { label: 'Valid Until:', value: '2026-09-10' },
      { label: 'Payment Terms:', value: 'Net 30 Days' },
      { label: 'Currency:', value: 'AED (United Arab Emirates Dirham)' }
    ]);

    this.items.set([
      { slNo: 1, itemName: 'Multifunction Calibrator 5522A', serialNo: 'SN-88201', roTagNo: 'TAG-CAL-01', make: 'Fluke', model: '5522A', range: '0-1000V DC/AC', qty: 1, unitPrice: '1,500.00', totalPrice: '1,500.00' },
      { slNo: 2, itemName: 'High Accuracy Pressure Module', serialNo: 'SN-40291', roTagNo: 'TAG-PRESS-02', make: 'Druck', model: 'DPI 620', range: '0-700 Bar', qty: 2, unitPrice: '450.00', totalPrice: '900.00' }
    ]);

    this.notes.set([
      '1. Prices are net and subject to 5% UAE VAT.',
      '2. Calibration turn-around time: 3 to 5 business days upon receiving equipment at laboratory.',
      '3. Certificate of Calibration with ISO 17025 accreditation sticker included.'
    ]);

    this.footerSignatures.set([
      { title: 'Prepared By Commercial Lead', name: 'Sarah Connor', subtitle: 'Commercial Metrology Executive' },
      { title: 'Approved By QA Manager', name: 'Dr. Marcus Vance', subtitle: 'Quality Assurance Manager' }
    ]);
  }

  setupWorkorderDoc(id: string) {
    this.documentTitle.set('LABORATORY CALIBRATION WORKORDER & ASSIGNMENT');
    this.badgeText.set('WORKORDER PREVIEW');

    this.metadataLeft.set([
      { label: 'Workorder No:', value: id },
      { label: 'Customer Name:', value: 'BioPharm Solutions' },
      { label: 'Asset Tag:', value: 'EQ-TEMP-002' },
      { label: 'Assigned Metrologist:', value: 'Alex Rivera (Senior Metrologist)' }
    ]);

    this.metadataRight.set([
      { label: 'Workorder Date:', value: new Date().toISOString().split('T')[0] },
      { label: 'Due Date:', value: '2026-08-15' },
      { label: 'Priority / Status:', value: 'HIGH / IN_PROGRESS' },
      { label: 'Accreditation:', value: 'ISO/IEC 17025:2017' }
    ]);

    this.items.set([
      { slNo: 1, itemName: 'Precision Temp Calibrator Bath', serialNo: 'SN-780491', roTagNo: 'TAG-TEMP-002', make: 'CAL-TECH', model: 'CAL-PRO 5000', range: '-30°C to +300°C', qty: 1 }
    ]);

    this.notes.set([
      '1. Verify reference standard calibration validity prior to starting calibration run.',
      '2. Record environmental temperature & humidity at start and end of test cycle.'
    ]);

    this.footerSignatures.set([
      { title: 'Assigned Metrologist', name: 'Alex Rivera', subtitle: 'Senior Metrologist' },
      { title: 'Technical Reviewer', name: 'Dr. Marcus Vance', subtitle: 'Technical Signatory' }
    ]);
  }

  setupCertificateDoc(id: string) {
    this.documentTitle.set('CERTIFICATE OF CALIBRATION (ISO/IEC 17025:2017)');
    this.badgeText.set('CERTIFICATE PREVIEW');

    this.metadataLeft.set([
      { label: 'Certificate No:', value: id },
      { label: 'Workorder No:', value: 'WO-2026-9104' },
      { label: 'Customer Name:', value: 'Apex Global Energy Solutions LLC' },
      { label: 'Facility Address:', value: 'Facility A-4, Sharjah Industrial Park, UAE' }
    ]);

    this.metadataRight.set([
      { label: 'Date of Calibration:', value: new Date().toISOString().split('T')[0] },
      { label: 'Next Due Date:', value: '2027-08-09' },
      { label: 'Reference SOP:', value: 'CAL-SOP-EC-01 Rev.4' },
      { label: 'Environmental Conditions:', value: '23.0°C ± 1.5°C | 52% RH' }
    ]);

    this.items.set([
      { slNo: 1, itemName: 'Relay Testing System', serialNo: 'SN-780491', roTagNo: 'TAG-CAL-2026', make: 'CAL-TECH', model: 'CAL-PRO 5000', range: '0-500V / 0-100A', qty: 1 }
    ]);

    this.notes.set([
      '1. The reported expanded uncertainty is based on a standard uncertainty multiplied by coverage factor k=2 (95% confidence level).',
      '2. This certificate shall not be reproduced except in full without written approval of CaliBro Laboratories.'
    ]);

    this.footerSignatures.set([
      { title: 'Calibrated By', name: 'Alex Rivera', subtitle: 'Senior Metrologist' },
      { title: 'Approved Signatory', name: 'Dr. Marcus Vance', subtitle: 'Quality Assurance Manager' }
    ]);
  }

  setupDeliveryTicketDoc(id: string) {
    this.documentTitle.set('EQUIPMENT DISPATCH & DELIVERY TICKET');
    this.badgeText.set('DELIVERY TICKET PREVIEW');

    this.metadataLeft.set([
      { label: 'Delivery Ticket No:', value: id },
      { label: 'Customer Name:', value: 'EMARAT ALOULA CONTRACTING CO' },
      { label: 'Delivery Address:', value: 'Industrial City Of Abu Dhabi 3, Abu Dhabi, UAE' },
      { label: 'Contact Person:', value: 'Ameer Abbaz Moideenkut' }
    ]);

    this.metadataRight.set([
      { label: 'Dispatch Date:', value: new Date().toISOString().split('T')[0] },
      { label: 'Logistics Driver:', value: 'Mohamed Farooq' },
      { label: 'Vehicle Tag:', value: 'VAN-CAL-04' },
      { label: 'Status:', value: 'DISPATCHED' }
    ]);

    this.items.set([
      { slNo: 1, itemName: '4-Gas Personal Monitor', serialNo: 'SN-99120', roTagNo: 'TAG-GAS-01', make: 'Honeywell', model: 'BW MAX XT II', range: '0-100 PPM', qty: 2 },
      { slNo: 2, itemName: 'Digital Pressure Indicator Gauge', serialNo: 'SN-78041', roTagNo: 'TAG-PRESS-04', make: 'Fluke', model: '700G31', range: '0 - 10,000 PSI', qty: 1 }
    ]);

    this.notes.set([
      '1. All listed calibrated instruments are delivered along with original hardcopy certificates and calibration stickers.',
      '2. Please inspect physical condition and sign confirmation upon receipt.'
    ]);

    this.footerSignatures.set([
      { title: 'Dispatched By (CaliBro)', name: 'Rachel Adams', subtitle: 'Logistics Supervisor' },
      { title: 'Received By (Customer)', name: 'Ameer Abbaz Moideenkut', subtitle: 'Customer Receiver' }
    ]);
  }

  setupInvoiceDoc(id: string) {
    this.documentTitle.set('TAX INVOICE & CALIBRATION BILLING STATEMENT');
    this.badgeText.set('INVOICE PREVIEW');

    this.metadataLeft.set([
      { label: 'Invoice No:', value: id },
      { label: 'Quotation Ref:', value: 'QT-2026-049' },
      { label: 'Customer TRN:', value: 'TRN-100392810400003' },
      { label: 'Billed To:', value: 'EMARAT ALOULA CONTRACTING CO' }
    ]);

    this.metadataRight.set([
      { label: 'Invoice Date:', value: new Date().toISOString().split('T')[0] },
      { label: 'Payment Due Date:', value: '2026-09-09' },
      { label: 'Payment Mode:', value: 'Bank Wire Transfer' },
      { label: 'Currency:', value: 'AED' }
    ]);

    this.items.set([
      { slNo: 1, itemName: 'ISO 17025 Calibration Service - 4-Gas Monitor', serialNo: 'SN-99120', roTagNo: 'TAG-GAS-01', make: 'Honeywell', model: 'BW MAX', range: '0-100 PPM', qty: 2, unitPrice: '350.00', totalPrice: '700.00' },
      { slNo: 2, itemName: 'ISO 17025 Calibration Service - Pressure Gauge', serialNo: 'SN-78041', roTagNo: 'TAG-PRESS-04', make: 'Fluke', model: '700G31', range: '0-10,000 PSI', qty: 1, unitPrice: '450.00', totalPrice: '450.00' }
    ]);

    this.notes.set([
      '1. Payment due within 30 days of invoice date.',
      '2. Bank Name: Emirates NBD | Account Name: CaliBro Calibration Labs LLC | IBAN: AE480330000019201948201'
    ]);

    this.footerSignatures.set([
      { title: 'Accounts Executive', name: 'Finance Controller', subtitle: 'CaliBro Accounts Dept' },
      { title: 'Authorized Representative', name: 'Dr. Marcus Vance', subtitle: 'Operations Manager' }
    ]);
  }

  setupDeliveryInDoc(id: string) {
    this.documentTitle.set('EQUIPMENT INTAKE & RECEIPT VOUCHER (DELIVERY IN)');
    this.badgeText.set('DELIVERY IN PREVIEW');

    this.metadataLeft.set([
      { label: 'Delivery In Voucher:', value: id },
      { label: 'Customer Name:', value: 'EMARAT ALOULA CONTRACTING CO' },
      { label: 'Received By:', value: 'Rachel Adams (Logistics Coordinator)' },
      { label: 'Intake Mode:', value: 'Hand Delivery' }
    ]);

    this.metadataRight.set([
      { label: 'Intake Date:', value: new Date().toISOString().split('T')[0] },
      { label: 'Gate Pass Ref:', value: 'GP-2026-901' },
      { label: 'Physical Condition:', value: 'Good / Clean' },
      { label: 'Status:', value: 'RECEIVED_AT_LAB' }
    ]);

    this.items.set([
      { slNo: 1, itemName: '4-Gas Personal Monitor', serialNo: 'SN-99120', roTagNo: 'TAG-GAS-01', make: 'Honeywell', model: 'BW MAX XT II', range: '0-100 PPM', qty: 2 },
      { slNo: 2, itemName: 'Digital Pressure Indicator Gauge', serialNo: 'SN-78041', roTagNo: 'TAG-PRESS-04', make: 'Fluke', model: '700G31', range: '0 - 10,000 PSI', qty: 1 }
    ]);

    this.notes.set([
      '1. Equipment received at lab intake counter and tagged for contract review.',
      '2. Accessories received: Power Adaptor, Test Probe Cable, Storage Case.'
    ]);

    this.footerSignatures.set([
      { title: 'Lab Intake Officer', name: 'Rachel Adams', subtitle: 'Logistics Officer' },
      { title: 'Delivered By (Customer)', name: 'Ameer Abbaz Moideenkut', subtitle: 'Customer Driver' }
    ]);
  }

  getQrCodeUrl(id: string): string {
    const certId = id || 'CERT-2026-1048';
    const targetUrl = window.location.origin + '/certificates/view/' + certId;
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(targetUrl)}`;
  }

  printDocument() {
    window.print();
  }

  exportPdf() {
    this.toastService.showInfo('Exporting PDF', 'Opening print-to-PDF dialog...');
    window.print();
  }

  exportXlsx() {
    const list = this.items();
    let csv = 'SlNo,Item Name,Serial No,RO/Tag No,Make,Model,Range,Qty,Unit Price,Total Price\n';
    list.forEach(i => {
      csv += `"${i.slNo}","${i.itemName}","${i.serialNo}","${i.roTagNo}","${i.make}","${i.model}","${i.range}","${i.qty}","${i.unitPrice || '-'}","${i.totalPrice || '-'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CaliBro_${this.docType()}_${this.docId()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.showSuccess('Export Successful', `Exported ${this.docType()} items to CSV/Excel.`);
  }

  closeTab() {
    window.close();
  }
}
