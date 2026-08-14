import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastService } from '../../services/toast.service';

export interface ImageUploadItem {
  key: string;
  title: string;
  description: string;
  previewUrl: string;
  fileSize: string;
  recommendedSize: string;
}

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputTextarea,
    ButtonModule,
    TagModule
  ],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.css'
})
export class CompanySettingsComponent implements OnInit {
  private toastService = inject(ToastService);

  public activeTab = signal<string>('profile'); // profile, branding, defaults, smtp

  // Tab 1: Company Profile Signals
  public companyName = signal<string>('CaliBro Calibration Laboratories LLC');
  public tradeLicenseNo = signal<string>('CN-1048290-UAE');
  public isoAccreditationNo = signal<string>('ENAS / DAC Accreditation No: IB-048');
  public isoStandard = signal<string>('ISO/IEC 17025:2017');
  public primaryPhone = signal<string>('+971 6 534 8920');
  public secondaryPhone = signal<string>('+971 50 123 4567');
  public officialEmail = signal<string>('info@calibro.ae');
  public supportEmail = signal<string>('support@calibro.ae');
  public websiteUrl = signal<string>('https://www.calibro.ae');
  public addressBuilding = signal<string>('Facility A-4, CaliBro Metrology Complex');
  public addressStreet = signal<string>('Street 12, Sharjah Industrial Zone 4');
  public addressEmirate = signal<string>('Sharjah');
  public addressCountry = signal<string>('United Arab Emirates');
  public poBox = signal<string>('P.O. Box 68420');
  public trnNumber = signal<string>('100482019400003'); // 5% UAE VAT TRN

  // Tab 2: Image Uploads Signals
  public companyLogoUrl = signal<string>('https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=CaliBroLogo');
  public isoSealUrl = signal<string>('https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=ISO17025Seal');
  public reportHeaderUrl = signal<string>('https://api.qrserver.com/v1/create-qr-code/?size=300x70&data=ReportHeaderBanner');
  public reportFooterUrl = signal<string>('https://api.qrserver.com/v1/create-qr-code/?size=300x70&data=ReportFooterBanner');
  public metrologistSealUrl = signal<string>('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=AlexRiveraSeal');
  public qaManagerSealUrl = signal<string>('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=DrMarcusVanceSeal');

  // Tab 3: System Defaults & Numbering Prefixes Signals
  public currencyCode = signal<string>('AED');
  public defaultVatRate = signal<number>(5.0);
  public defaultCalibPeriodMonths = signal<number>(12);
  public prefixEnquiry = signal<string>('ENQ-');
  public prefixQuotation = signal<string>('QT-');
  public prefixWorkorder = signal<string>('WO-');
  public prefixCertificate = signal<string>('CERT-');
  public prefixDeliveryTicket = signal<string>('DT-');
  public prefixInvoice = signal<string>('INV-');
  public defaultTemp = signal<string>('23.0 ± 2.0 °C');
  public defaultPress = signal<string>('1013.2 ± 10 mbar');
  public defaultHumidity = signal<string>('50 ± 10 %rh');

  // Tab 4: SMTP Email Settings Signals
  public smtpHost = signal<string>('smtp.calibro.ae');
  public smtpPort = signal<number>(587);
  public smtpUsername = signal<string>('notifications@calibro.ae');
  public smtpPassword = signal<string>('••••••••••••••••');
  public senderName = signal<string>('CaliBro Laboratory System Notifications');
  public senderEmail = signal<string>('noreply@calibro.ae');
  public autoSendQuotation = signal<boolean>(true);
  public autoSendWorkorder = signal<boolean>(true);
  public autoSendCertificate = signal<boolean>(true);
  public autoSendInvoice = signal<boolean>(true);

  ngOnInit() {}

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  saveProfile() {
    this.toastService.showSuccess('Settings Saved', 'Company profile and accreditation details updated successfully.');
  }

  saveBranding() {
    this.toastService.showSuccess('Branding Saved', 'Report header/footer banners and signature stamps updated.');
  }

  saveDefaults() {
    this.toastService.showSuccess('Defaults Saved', 'Document numbering prefixes and environmental standards updated.');
  }

  saveSmtp() {
    this.toastService.showSuccess('SMTP Saved', 'Mail server parameters and automated email dispatch settings saved.');
  }

  testSmtpConnection() {
    this.toastService.showInfo('SMTP Test', 'Testing connection to smtp.calibro.ae:587... Connection Successful!');
  }

  onFileSelected(event: any, target: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const url = e.target.result;
        switch (target) {
          case 'logo': this.companyLogoUrl.set(url); break;
          case 'iso': this.isoSealUrl.set(url); break;
          case 'header': this.reportHeaderUrl.set(url); break;
          case 'footer': this.reportFooterUrl.set(url); break;
          case 'metrologist': this.metrologistSealUrl.set(url); break;
          case 'qa': this.qaManagerSealUrl.set(url); break;
        }
        this.toastService.showSuccess('Image Uploaded', `${target.toUpperCase()} image uploaded successfully.`);
      };
      reader.readAsDataURL(file);
    }
  }
}
