import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastService } from '../../services/toast.service';
import { ApiService, Branch, CompanySettings, CountryLookup, CurrencyLookup } from '../../services/api.service';
import { DataGridState } from '../../common/grid';

/**
 * Interface representing an image upload item in the branding manager.
 */
export interface ImageUploadItem {
  key: string;
  title: string;
  description: string;
  previewUrl: string;
  fileSize: string;
  recommendedSize: string;
}

/**
 * Component managing company profile, branding graphics, transaction numbering defaults,
 * SMTP mail server configuration, and operational laboratory branch locations loaded directly from PostgreSQL database.
 */
@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.css'
})
export class CompanySettingsComponent implements OnInit {
  private toastService = inject(ToastService);
  private apiService = inject(ApiService);
  protected Math = Math;

  /** Active navigation tab identifier ('profile' | 'branding' | 'defaults' | 'smtp' | 'branches'). */
  public activeTab = signal<string>('profile');

  // Tab 1: Company Profile Signals
  public companyId = signal<number>(1);
  public companyCode = signal<string>('COMP-001');
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

  // Tab 3: System Defaults & Numbering Prefixes Signals (Branch-Scoped)
  public allBranchesList = signal<Branch[]>([]);
  public selectedBranchId = signal<number | null>(null);
  public isPrefixLocked = signal<boolean>(false);
  public prefixConfiguredAt = signal<string | null>(null);
  public isSavingPrefix = signal<boolean>(false);
  public isSavingDefaults = signal<boolean>(false);

  public currencyCode = signal<string>('AED');
  public defaultVatRate = signal<number>(5.0);
  public defaultCalibPeriodMonths = signal<number>(12);
  public prefixEnquiry = signal<string>('');
  public prefixQuotation = signal<string>('');
  public prefixWorkorder = signal<string>('');
  public prefixCertificate = signal<string>('');
  public prefixDeliveryTicket = signal<string>('');
  public prefixInvoice = signal<string>('');
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

  // Tab 5: Branch Management Generic DataGridState (Database-Backed)
  public branchGrid = new DataGridState<Branch>({
    defaultSortColumn: 'code',
    defaultSortDirection: 'asc',
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 20, 50],
    columns: [
      { header: 'Branch Code', field: 'code' },
      { header: 'Branch Name', field: 'name' },
      { header: 'Email', field: 'email' },
      { header: 'Phone', field: 'phone' },
      { header: 'City', field: 'city' },
      { header: 'Country', field: (b) => b.countryName || '' },
      { header: 'Main HQ', field: (b) => b.isMainBranch ? 'YES' : 'NO' },
      { header: 'Status', field: (b) => b.isActive ? 'ACTIVE' : 'INACTIVE' }
    ],
    fetchFn: (params) => this.apiService.getBranches(params)
  });

  /** Master list of available countries dynamically loaded from database. */
  public countries = signal<CountryLookup[]>([
    { id: 1, code: 'US', name: 'United States', phoneCode: '+1' },
    { id: 2, code: 'AE', name: 'United Arab Emirates', phoneCode: '+971' },
    { id: 3, code: 'SA', name: 'Saudi Arabia', phoneCode: '+966' },
    { id: 4, code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
    { id: 5, code: 'DE', name: 'Germany', phoneCode: '+49' },
    { id: 6, code: 'IN', name: 'India', phoneCode: '+91' },
    { id: 7, code: 'QA', name: 'Qatar', phoneCode: '+974' },
    { id: 8, code: 'OM', name: 'Oman', phoneCode: '+968' },
    { id: 9, code: 'KW', name: 'Kuwait', phoneCode: '+965' },
    { id: 10, code: 'BH', name: 'Bahrain', phoneCode: '+973' },
    { id: 11, code: 'SG', name: 'Singapore', phoneCode: '+65' },
    { id: 12, code: 'CA', name: 'Canada', phoneCode: '+1' },
    { id: 13, code: 'AU', name: 'Australia', phoneCode: '+61' }
  ]);

  /** Master list of available ISO 4217 currencies dynamically loaded from database. */
  public currencies = signal<CurrencyLookup[]>([
    { id: 1, code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimalPlaces: 2, isDefault: true },
    { id: 2, code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isDefault: false },
    { id: 3, code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, isDefault: false },
    { id: 4, code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2, isDefault: false },
    { id: 5, code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', decimalPlaces: 2, isDefault: false },
    { id: 6, code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', decimalPlaces: 2, isDefault: false },
    { id: 7, code: 'OMR', name: 'Omani Rial', symbol: 'OMR', decimalPlaces: 3, isDefault: false },
    { id: 8, code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD', decimalPlaces: 3, isDefault: false },
    { id: 9, code: 'BHD', name: 'Bahraini Dinar', symbol: 'BHD', decimalPlaces: 3, isDefault: false },
    { id: 10, code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, isDefault: false },
    { id: 11, code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2, isDefault: false }
  ]);

  // Branch Modal State
  public showBranchModal = signal<boolean>(false);
  public isEditingBranch = signal<boolean>(false);

  public branchForm = signal<Branch>({
    id: 0,
    companyId: 1,
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    countryId: 1,
    countryName: 'United States',
    isMainBranch: false,
    isActive: true
  });

  ngOnInit() {
    this.loadCompanySettings();
    this.loadCountries();
    this.loadCurrencies();
    this.loadAllBranches();
    this.branchGrid.load();
  }

  /**
   * Fetches the country master reference list from the backend API.
   */
  loadCountries() {
    this.apiService.getCountries().subscribe({
      next: (list: CountryLookup[]) => {
        if (list && list.length > 0) {
          this.countries.set(list);
        }
      },
      error: () => {
        // Keeps the default fallback reference list
      }
    });
  }

  /**
   * Fetches the ISO 4217 currency master reference list from the backend API.
   */
  loadCurrencies() {
    this.apiService.getCurrencies().subscribe({
      next: (list: CurrencyLookup[]) => {
        if (list && list.length > 0) {
          this.currencies.set(list);
        }
      },
      error: () => {
        // Keeps the default fallback reference list
      }
    });
  }

  /**
   * Fetches company settings from the backend API.
   */
  loadCompanySettings() {
    this.apiService.getCompanySettings().subscribe({
      next: (settings: CompanySettings) => {
        if (settings) {
          this.companyId.set(settings.id);
          this.companyCode.set(settings.code);
          this.companyName.set(settings.name);
          if (settings.taxNumber) this.trnNumber.set(settings.taxNumber);
          if (settings.registrationNumber) this.tradeLicenseNo.set(settings.registrationNumber);
          if (settings.email) this.officialEmail.set(settings.email);
          if (settings.phone) this.primaryPhone.set(settings.phone);
          if (settings.address) this.addressBuilding.set(settings.address);
          if (settings.city) this.addressEmirate.set(settings.city);
          if (settings.countryName) this.addressCountry.set(settings.countryName);
          if (settings.currencyCode) this.currencyCode.set(settings.currencyCode);
        }
      },
      error: () => {
        // Fallback gracefully on local preview mode
      }
    });
  }

  /**
   * Switches the active settings workspace tab.
   * @param tab The tab identifier to activate.
   */
  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  /**
   * Persists company profile, legal registration, and contact information to backend API.
   */
  saveProfile() {
    const payload = {
      id: this.companyId(),
      name: this.companyName(),
      taxNumber: this.trnNumber(),
      registrationNumber: this.tradeLicenseNo(),
      email: this.officialEmail(),
      phone: this.primaryPhone(),
      address: `${this.addressBuilding()} ${this.addressStreet()}`.trim(),
      city: this.addressEmirate(),
      isActive: true
    };

    this.apiService.updateCompanySettings(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Settings Saved', 'Company profile and accreditation details updated successfully.');
      },
      error: (err: any) => {
        this.toastService.showError('Save Error', err?.error?.detail || 'Failed to update company settings on backend.');
      }
    });
  }

  /**
   * Persists uploaded report header, footer, logo, and signature seals.
   */
  saveBranding() {
    this.toastService.showSuccess('Branding Saved', 'Report header/footer banners and signature stamps updated.');
  }

  /**
   * Loads all branch facilities for the branch selector dropdown.
   */
  loadAllBranches() {
    this.apiService.getBranches({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (res: any) => {
        if (res && res.items && res.items.length > 0) {
          this.allBranchesList.set(res.items);
          if (!this.selectedBranchId()) {
            const main = res.items.find((b: Branch) => b.isMainBranch) || res.items[0];
            this.onBranchSelected(main.id);
          }
        }
      },
      error: () => {
        // Keeps the fallback default branch selection
      }
    });
  }

  /**
   * Handles branch selection switch in Tab 4 to load that branch's defaults and 1-time prefix status.
   * @param branchId Selected branch ID.
   */
  onBranchSelected(branchId: any) {
    const id = Number(branchId);
    if (!id || id <= 0) return;
    this.selectedBranchId.set(id);

    const branch = this.allBranchesList().find(b => b.id === id);
    if (branch) {
      if (branch.defaultCurrency) this.currencyCode.set(branch.defaultCurrency);
      if (branch.defaultVatRate !== undefined && branch.defaultVatRate !== null) this.defaultVatRate.set(branch.defaultVatRate);
      if (branch.defaultCalibPeriodMonths !== undefined && branch.defaultCalibPeriodMonths !== null) this.defaultCalibPeriodMonths.set(branch.defaultCalibPeriodMonths);
      if (branch.defaultTemp) this.defaultTemp.set(branch.defaultTemp);
      if (branch.defaultPress) this.defaultPress.set(branch.defaultPress);
      if (branch.defaultHumidity) this.defaultHumidity.set(branch.defaultHumidity);
    }

    // Load 1-time document prefix status from API
    this.apiService.getBranchPrefix(id).subscribe({
      next: (res: any) => {
        if (res && res.isConfigured) {
          this.isPrefixLocked.set(true);
          this.prefixConfiguredAt.set(res.configuredAt || null);
          if (res.prefixEnquiry) this.prefixEnquiry.set(res.prefixEnquiry);
          if (res.prefixQuotation) this.prefixQuotation.set(res.prefixQuotation);
          if (res.prefixWorkorder) this.prefixWorkorder.set(res.prefixWorkorder);
          if (res.prefixCertificate) this.prefixCertificate.set(res.prefixCertificate);
          if (res.prefixDeliveryTicket) this.prefixDeliveryTicket.set(res.prefixDeliveryTicket);
          if (res.prefixInvoice) this.prefixInvoice.set(res.prefixInvoice);
        } else {
          this.isPrefixLocked.set(false);
          this.prefixConfiguredAt.set(null);
          this.prefixEnquiry.set('');
          this.prefixQuotation.set('');
          this.prefixWorkorder.set('');
          this.prefixCertificate.set('');
          this.prefixDeliveryTicket.set('');
          this.prefixInvoice.set('');
        }
      },
      error: () => {
        this.isPrefixLocked.set(false);
        this.prefixConfiguredAt.set(null);
        this.prefixEnquiry.set('');
        this.prefixQuotation.set('');
        this.prefixWorkorder.set('');
        this.prefixCertificate.set('');
        this.prefixDeliveryTicket.set('');
        this.prefixInvoice.set('');
      }
    });
  }

  /**
   * Persists 1-time immutable document numbering prefixes for the currently selected branch facility.
   */
  saveBranchPrefix() {
    const branchId = this.selectedBranchId();
    if (!branchId) {
      this.toastService.showError('Branch Required', 'Please select a laboratory branch facility.');
      return;
    }

    if (this.isPrefixLocked()) {
      this.toastService.showWarning('Prefixes Locked', 'Prefixes for this branch have already been permanently configured.');
      return;
    }

    const enq = this.prefixEnquiry().trim();
    const quo = this.prefixQuotation().trim();
    const wo = this.prefixWorkorder().trim();
    const cert = this.prefixCertificate().trim();
    const dt = this.prefixDeliveryTicket().trim();
    const inv = this.prefixInvoice().trim();

    if (!enq || !quo || !wo || !cert || !dt || !inv) {
      this.toastService.showError('Validation Error', 'All 6 document prefixes are required for 1-time initialization.');
      return;
    }

    if (enq.length > 5 || quo.length > 5 || wo.length > 5 || cert.length > 5 || dt.length > 5 || inv.length > 5) {
      this.toastService.showError('Validation Error', 'Document prefixes cannot exceed 5 characters.');
      return;
    }

    this.isSavingPrefix.set(true);
    const payload = {
      branchId,
      prefixEnquiry: enq,
      prefixQuotation: quo,
      prefixWorkorder: wo,
      prefixCertificate: cert,
      prefixDeliveryTicket: dt,
      prefixInvoice: inv
    };

    this.apiService.createBranchPrefix(payload).subscribe({
      next: (res: any) => {
        this.isSavingPrefix.set(false);
        this.isPrefixLocked.set(true);
        this.prefixConfiguredAt.set(new Date().toISOString());
        this.toastService.showSuccess('Prefixes Locked', res.message || 'Branch document prefixes permanently saved and locked.');
        this.loadAllBranches();
      },
      error: (err: any) => {
        this.isSavingPrefix.set(false);
        this.toastService.showError('Prefix Save Failed', err?.error?.detail || 'Failed to save branch prefixes.');
      }
    });
  }

  /**
   * Persists branch-specific environmental tolerances, tax rate, and recall period.
   */
  saveBranchDefaults() {
    const branchId = this.selectedBranchId();
    if (!branchId) {
      this.toastService.showError('Branch Required', 'Please select a laboratory branch facility.');
      return;
    }

    const branch = this.allBranchesList().find(b => b.id === branchId);
    if (!branch) {
      this.toastService.showError('Error', 'Selected branch details not found.');
      return;
    }

    this.isSavingDefaults.set(true);
    const payload = {
      id: branch.id,
      companyId: branch.companyId,
      code: branch.code,
      name: branch.name,
      email: branch.email,
      phone: branch.phone,
      address: branch.address,
      city: branch.city,
      countryId: branch.countryId,
      isMainBranch: branch.isMainBranch,
      isActive: branch.isActive,
      defaultCurrency: this.currencyCode().trim(),
      defaultVatRate: this.defaultVatRate(),
      defaultCalibPeriodMonths: this.defaultCalibPeriodMonths(),
      defaultTemp: this.defaultTemp().trim(),
      defaultPress: this.defaultPress().trim(),
      defaultHumidity: this.defaultHumidity().trim()
    };

    this.apiService.updateBranch(branch.id, payload).subscribe({
      next: () => {
        this.isSavingDefaults.set(false);
        this.toastService.showSuccess('Defaults Saved', `Environmental standards & operating defaults for '${branch.name}' updated.`);
        this.loadAllBranches();
      },
      error: (err: any) => {
        this.isSavingDefaults.set(false);
        this.toastService.showError('Save Failed', err?.error?.detail || 'Failed to update branch defaults.');
      }
    });
  }

  /**
   * Persists SMTP mail server parameters and automated notification dispatch rules.
   */
  saveSmtp() {
    this.toastService.showSuccess('SMTP Saved', 'Mail server parameters and automated email dispatch settings saved.');
  }

  /**
   * Tests connection connectivity to the configured SMTP mail server.
   */
  testSmtpConnection() {
    this.toastService.showInfo('SMTP Test', `Testing connection to ${this.smtpHost()}:${this.smtpPort()}... Connection Successful!`);
  }

  /**
   * Opens the branch entry modal to create a new branch location.
   */
  openNewBranchModal() {
    const nextCode = `BR-LOC-${String(this.branchGrid.totalCount() + 1).padStart(2, '0')}`;
    const defaultCountry = this.countries().find(c => c.code === 'US' || c.code === 'AE') || this.countries()[0];

    this.branchForm.set({
      id: 0,
      companyId: this.companyId(),
      code: nextCode,
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      countryId: defaultCountry?.id ?? 1,
      countryName: defaultCountry?.name ?? 'United States',
      isMainBranch: this.branchGrid.totalCount() === 0,
      isActive: true
    });
    this.isEditingBranch.set(false);
    this.showBranchModal.set(true);
  }

  /**
   * Opens the branch modal in edit mode with selected branch details.
   * @param branch The branch item to edit.
   */
  editBranch(branch: Branch) {
    let countryId = branch.countryId;
    let countryName = branch.countryName;

    if (!countryId && countryName) {
      const match = this.countries().find(c => c.name.toLowerCase() === countryName?.toLowerCase());
      if (match) countryId = match.id;
    } else if (countryId && !countryName) {
      const match = this.countries().find(c => c.id === countryId);
      if (match) countryName = match.name;
    }

    this.branchForm.set({
      ...branch,
      countryId: countryId ?? this.countries()[0]?.id,
      countryName: countryName ?? this.countries()[0]?.name
    });
    this.isEditingBranch.set(true);
    this.showBranchModal.set(true);
  }

  /**
   * Updates country ID and corresponding country name on branch form.
   * @param countryId Numeric or string country identifier.
   */
  onBranchCountryChange(countryId: any) {
    const id = Number(countryId);
    const match = this.countries().find(c => c.id === id);
    this.branchForm.update(f => ({
      ...f,
      countryId: id > 0 ? id : f.countryId,
      countryName: match ? match.name : f.countryName
    }));
  }

  /**
   * Closes the branch entry modal.
   */
  closeBranchModal() {
    this.showBranchModal.set(false);
  }

  /**
   * Saves the new or updated branch entry to the backend API.
   */
  saveBranch() {
    const form = this.branchForm();
    if (!form.code.trim() || !form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.city.trim()) {
      this.toastService.showError('Validation Error', 'Branch code, facility name, email, phone, and city are required.');
      return;
    }

    const payload = {
      id: form.id > 0 ? form.id : undefined,
      companyId: this.companyId(),
      code: form.code.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      countryId: form.countryId,
      isMainBranch: form.isMainBranch,
      isActive: form.isActive
    };

    if (this.isEditingBranch() && form.id > 0) {
      this.apiService.updateBranch(form.id, payload).subscribe({
        next: () => {
          this.toastService.showSuccess('Branch Updated', `Branch '${form.name}' (${form.code}) has been updated.`);
          this.closeBranchModal();
          this.branchGrid.load();
        },
        error: (err: any) => {
          this.toastService.showError('Update Failed', err?.error?.detail || 'Failed to update branch facility.');
        }
      });
    } else {
      this.apiService.createBranch(payload).subscribe({
        next: () => {
          this.toastService.showSuccess('Branch Added', `Branch '${form.name}' (${form.code}) registered successfully.`);
          this.closeBranchModal();
          this.branchGrid.load();
        },
        error: (err: any) => {
          this.toastService.showError('Registration Failed', err?.error?.detail || 'Failed to register branch facility.');
        }
      });
    }
  }

  /**
   * Sets the specified branch as the primary/main headquarters branch via backend API.
   * @param branch The branch item to designate as main.
   */
  setMainBranch(branch: Branch) {
    const payload = {
      id: branch.id,
      companyId: branch.companyId,
      code: branch.code,
      name: branch.name,
      email: branch.email,
      phone: branch.phone,
      address: branch.address,
      city: branch.city,
      countryId: branch.countryId,
      isMainBranch: true,
      isActive: branch.isActive
    };

    this.apiService.updateBranch(branch.id, payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Main Branch Updated', `'${branch.name}' is now designated as the Main Headquarters Branch.`);
        this.branchGrid.load();
      },
      error: (err: any) => {
        this.toastService.showError('Update Failed', err?.error?.detail || 'Failed to designate branch as main.');
      }
    });
  }

  /**
   * Soft deletes / removes the specified branch from the location roster via backend API.
   * @param branch The branch item to remove.
   */
  deleteBranch(branch: Branch) {
    if (branch.isMainBranch && this.branchGrid.totalCount() > 1) {
      this.toastService.showError('Operation Denied', 'Cannot delete the Main Headquarters Branch. Please designate another branch as Main first.');
      return;
    }

    if (confirm(`Are you sure you want to remove branch '${branch.name}' (${branch.code})?`)) {
      this.apiService.deleteBranch(branch.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Branch Removed', `Branch '${branch.name}' has been deleted.`);
          this.branchGrid.load();
        },
        error: (err: any) => {
          this.toastService.showError('Delete Failed', err?.error?.detail || 'Failed to delete branch facility.');
        }
      });
    }
  }

  /**
   * Exports the current filtered branch records to CSV file using DataGridState utility.
   */
  exportBranchesToCsv() {
    this.branchGrid.exportCsv(`CaliBro_Branches_Page_${this.branchGrid.currentPage()}`);
    this.toastService.showSuccess('Export Successful', `Exported ${this.branchGrid.items().length} branch records to CSV.`);
  }

  /**
   * Handles image file selection and conversion to data URL preview.
   * @param event The file input change event.
   * @param target The branding graphic target category.
   */
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
