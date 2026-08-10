import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';

export interface EnquiryPrintItem {
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
  selector: 'app-enquiry-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enquiry-print.component.html',
  styleUrl: './enquiry-print.component.css'
})
export class EnquiryPrintComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  public enquiryId = signal<string>('ENQ-2026-081');

  public enquiryDetails = signal({
    enqNo: 'ENQ-2026-081',
    mode: 'Mail',
    nature: 'Calibration (CAL)',
    client: 'EMARAT ALOULA CONTRACTING CO',
    address: 'Industrial City Of Abu Dhabi 3, Abu Dhabi, United Arab Emirates',
    poBox: '26831',
    contactPerson: 'Ameer Abbaz Moideenkut',
    email: 'ameer.moideenkut@emarataloula.com',
    enqDate: '2026-08-09',
    reference: 'REF-EA-2026-904',
    telNo: '+971 2 5130513',
    fax: '+971 2 5130519',
    designation: 'QA/QC Manager',
    department: 'Metrology Dept',
    revNo: '00',
    revDate: '2026-08-09',
    status: 'OPEN'
  });

  public items = signal<EnquiryPrintItem[]>([
    { slNo: 1, itemName: '4-Gas Personal Monitor (H2S/CO/O2/LEL)', serialNo: 'SN-99120', roTagNo: 'TAG-GAS-01', make: 'Honeywell', model: 'BW MAX XT II', range: '0-100 PPM / 0-25% VOL', qty: 2 },
    { slNo: 2, itemName: 'Digital Pressure Indicator Gauge', serialNo: 'SN-78041', roTagNo: 'TAG-PRESS-04', make: 'Fluke Calibration', model: '700G31', range: '0 - 10,000 PSI', qty: 1 },
    { slNo: 3, itemName: 'Precision Temperature Calibrator Bath', serialNo: 'SN-54902', roTagNo: 'TAG-TEMP-02', make: 'Isotech', model: 'Jupiter 650', range: '-35°C to +650°C', qty: 1 }
  ]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.enquiryId.set(id);
      this.enquiryDetails.update(d => ({ ...d, enqNo: id }));
    }
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
    let csv = 'SlNo,Item Name,Serial No,RO/Tag No,Make,Model,Range,Qty\n';
    list.forEach(i => {
      csv += `"${i.slNo}","${i.itemName}","${i.serialNo}","${i.roTagNo}","${i.make}","${i.model}","${i.range}","${i.qty}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Enquiry_${this.enquiryId()}_Items.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.showSuccess('Export Successful', 'Enquiry items exported to CSV/Excel.');
  }

  closeTab() {
    window.close();
  }
}
