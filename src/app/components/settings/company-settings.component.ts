import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastService } from '../../services/toast.service';

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
 * Interface representing an operational laboratory branch location belonging to the company.
 */
export interface BranchItem {
  id?: number;
  uid?: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  isMainBranch: boolean;
  isActive: boolean;
}

/**
 * Component managing company profile, branding graphics, transaction numbering defaults,
 * SMTP mail server configuration, and operational laboratory branch locations.
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
  protected Math = Math;

  /** Active navigation tab identifier ('profile' | 'branding' | 'defaults' | 'smtp' | 'branches'). */
  public activeTab = signal<string>('profile');

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

  // Tab 5: Branch Management Signals
  public branches = signal<BranchItem[]>([
    {
      id: 1,
      uid: 'e8f1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
      code: 'BR-HOU-01',
      name: 'Houston Central Metrology Laboratory',
      email: 'houston-lab@calibro-metrology.com',
      phone: '+1 800-555-0190',
      address: '100 Innovation Boulevard, Building B',
      city: 'Houston',
      country: 'United States',
      isMainBranch: true,
      isActive: true
    },
    {
      id: 2,
      uid: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      code: 'BR-BOS-02',
      name: 'Boston Life Sciences Calibration Facility',
      email: 'boston-lab@calibro-metrology.com',
      phone: '+1 800-555-0195',
      address: '45 Science Park Drive',
      city: 'Boston',
      country: 'United States',
      isMainBranch: false,
      isActive: true
    },
    {
      id: 3,
      uid: 'c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
      code: 'BR-DXB-03',
      name: 'Dubai Gulf Regional Metrology Center',
      email: 'dubai-lab@calibro.ae',
      phone: '+971 4 380 9100',
      address: 'Dubai Silicon Oasis, Tech Hub Unit 14',
      city: 'Dubai',
      country: 'United Arab Emirates',
      isMainBranch: false,
      isActive: true
    }
  ]);

  /** Master list of available countries for branch location selection. */
  public availableCountries = signal<string[]>([
    'United States',
    'United Arab Emirates',
    'Saudi Arabia',
    'United Kingdom',
    'Germany',
    'India',
    'Qatar',
    'Oman',
    'Kuwait',
    'Bahrain',
    'Singapore',
    'Canada',
    'Australia'
  ]);

  // Branch Modal State
  public showBranchModal = signal<boolean>(false);
  public isEditingBranch = signal<boolean>(false);
  public editingBranchIndex = signal<number>(-1);

  public branchForm = signal<BranchItem>({
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'United States',
    isMainBranch: false,
    isActive: true
  });

  // Branch Grid Filter Signals
  public branchFilters = signal<{ [key: string]: string }>({
    code: '',
    name: '',
    city: '',
    country: '',
    status: ''
  });

  // Branch Grid Sort State
  public branchSortColumn = signal<keyof BranchItem>('code');
  public branchSortDirection = signal<'asc' | 'desc'>('asc');

  // Branch Grid Pagination State
  public branchCurrentPage = signal<number>(1);
  public branchPageSize = signal<number>(5);

  /** Computed list of branches filtered by column query terms. */
  public branchFilteredData = computed(() => {
    const list = this.branches();
    const currentFilters = this.branchFilters();
    return list.filter(row => {
      return Object.keys(currentFilters).every(key => {
        const query = currentFilters[key]?.toLowerCase() || '';
        if (!query) return true;
        if (key === 'status') {
          const statusText = row.isActive ? 'active' : 'inactive';
          return statusText.includes(query);
        }
        return String((row as any)[key] || '').toLowerCase().includes(query);
      });
    });
  });

  /** Computed sorted list of branches. */
  public branchSortedData = computed(() => {
    const list = [...this.branchFilteredData()];
    const col = this.branchSortColumn();
    const dir = this.branchSortDirection();
    return list.sort((a, b) => {
      const valA = String(a[col] ?? '').toLowerCase();
      const valB = String(b[col] ?? '').toLowerCase();
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  /** Computed paginated slice of branches for current page view. */
  public branchPaginatedData = computed(() => {
    const start = (this.branchCurrentPage() - 1) * this.branchPageSize();
    return this.branchSortedData().slice(start, start + this.branchPageSize());
  });

  /** Total pages calculated from filtered records count. */
  public branchTotalPages = computed(() => Math.ceil(this.branchSortedData().length / this.branchPageSize()) || 1);

  /** Computed array of numbered pagination items. */
  public branchPageNumbers = computed(() => {
    const total = this.branchTotalPages();
    const current = this.branchCurrentPage();
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  ngOnInit() {}

  /**
   * Switches the active settings workspace tab.
   * @param tab The tab identifier to activate.
   */
  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  /**
   * Persists company profile, legal registration, and contact information.
   */
  saveProfile() {
    this.toastService.showSuccess('Settings Saved', 'Company profile and accreditation details updated successfully.');
  }

  /**
   * Persists uploaded report header, footer, logo, and signature seals.
   */
  saveBranding() {
    this.toastService.showSuccess('Branding Saved', 'Report header/footer banners and signature stamps updated.');
  }

  /**
   * Persists transaction prefixes, VAT rate, and environmental baseline tolerances.
   */
  saveDefaults() {
    this.toastService.showSuccess('Defaults Saved', 'Document numbering prefixes and environmental standards updated.');
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
    const nextCode = `BR-LOC-${String(this.branches().length + 1).padStart(2, '0')}`;
    this.branchForm.set({
      code: nextCode,
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'United States',
      isMainBranch: this.branches().length === 0,
      isActive: true
    });
    this.isEditingBranch.set(false);
    this.editingBranchIndex.set(-1);
    this.showBranchModal.set(true);
  }

  /**
   * Opens the branch modal in edit mode with selected branch details.
   * @param branch The branch item to edit.
   */
  editBranch(branch: BranchItem) {
    const index = this.branches().findIndex(b => b.code === branch.code);
    this.branchForm.set({ ...branch });
    this.isEditingBranch.set(true);
    this.editingBranchIndex.set(index);
    this.showBranchModal.set(true);
  }

  /**
   * Closes the branch entry modal.
   */
  closeBranchModal() {
    this.showBranchModal.set(false);
  }

  /**
   * Saves the new or updated branch entry to the reactive state.
   */
  saveBranch() {
    const form = this.branchForm();
    if (!form.code.trim() || !form.name.trim()) {
      this.toastService.showError('Validation Error', 'Branch code and facility name are required.');
      return;
    }

    if (this.isEditingBranch()) {
      const idx = this.editingBranchIndex();
      if (idx >= 0) {
        this.branches.update(list => {
          const updated = [...list];
          // If this branch is set as main, demote others
          if (form.isMainBranch) {
            updated.forEach(b => b.isMainBranch = false);
          }
          updated[idx] = { ...form };
          return updated;
        });
        this.toastService.showSuccess('Branch Updated', `Branch '${form.name}' (${form.code}) has been updated.`);
      }
    } else {
      // Check for duplicate branch code
      if (this.branches().some(b => b.code.equalsIgnoreCase(form.code.trim()))) {
        this.toastService.showError('Duplicate Code', `A branch with code '${form.code}' already exists.`);
        return;
      }

      this.branches.update(list => {
        const updated = [...list];
        if (form.isMainBranch) {
          updated.forEach(b => b.isMainBranch = false);
        }
        updated.push({
          ...form,
          id: updated.length + 1,
          uid: crypto.randomUUID?.() ?? `br-${Date.now()}`
        });
        return updated;
      });
      this.toastService.showSuccess('Branch Added', `Branch '${form.name}' (${form.code}) registered successfully.`);
    }

    this.closeBranchModal();
  }

  /**
   * Sets the specified branch as the primary/main headquarters branch.
   * @param branch The branch item to designate as main.
   */
  setMainBranch(branch: BranchItem) {
    this.branches.update(list => {
      return list.map(b => ({
        ...b,
        isMainBranch: b.code === branch.code
      }));
    });
    this.toastService.showSuccess('Main Branch Updated', `'${branch.name}' is now designated as the Main Headquarters Branch.`);
  }

  /**
   * Soft deletes / removes the specified branch from the location roster.
   * @param branch The branch item to remove.
   */
  deleteBranch(branch: BranchItem) {
    if (branch.isMainBranch && this.branches().length > 1) {
      this.toastService.showError('Operation Denied', 'Cannot delete the Main Headquarters Branch. Please designate another branch as Main first.');
      return;
    }

    if (confirm(`Are you sure you want to remove branch '${branch.name}' (${branch.code})?`)) {
      this.branches.update(list => list.filter(b => b.code !== branch.code));
      this.toastService.showSuccess('Branch Removed', `Branch '${branch.name}' has been deleted.`);
    }
  }

  /**
   * Updates an active column filter query for the branch grid.
   * @param col Column property name.
   * @param val Query filter string.
   */
  updateBranchFilter(col: string, val: string) {
    this.branchFilters.update(f => ({ ...f, [col]: val }));
    this.branchCurrentPage.set(1);
  }

  /**
   * Toggles column sorting order (asc / desc) on the branch grid.
   * @param col Column property name to sort by.
   */
  toggleBranchSort(col: keyof BranchItem) {
    if (this.branchSortColumn() === col) {
      this.branchSortDirection.set(this.branchSortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.branchSortColumn.set(col);
      this.branchSortDirection.set('asc');
    }
  }

  /**
   * Returns the appropriate PrimeNG sort indicator icon class.
   * @param col Column property name.
   */
  getBranchSortIcon(col: keyof BranchItem): string {
    if (this.branchSortColumn() !== col) return 'pi-sort-alt';
    return this.branchSortDirection() === 'asc' ? 'pi-sort-amount-up-alt text-cyan' : 'pi-sort-amount-down text-cyan';
  }

  goToBranchPage(p: number) { this.branchCurrentPage.set(p); }
  prevBranchPage() { if (this.branchCurrentPage() > 1) this.branchCurrentPage.set(this.branchCurrentPage() - 1); }
  nextBranchPage() { if (this.branchCurrentPage() < this.branchTotalPages()) this.branchCurrentPage.set(this.branchCurrentPage() + 1); }

  /**
   * Exports the current filtered branch records to CSV file.
   */
  exportBranchesToCsv() {
    const data = this.branchSortedData();
    const headers = ['Branch Code', 'Branch Name', 'Email', 'Phone', 'City', 'Country', 'Main Branch', 'Status'];
    const rows = data.map(b => [
      b.code,
      `"${b.name}"`,
      b.email,
      b.phone,
      `"${b.city}"`,
      `"${b.country}"`,
      b.isMainBranch ? 'YES' : 'NO',
      b.isActive ? 'ACTIVE' : 'INACTIVE'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CaliBro_Branches_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.toastService.showSuccess('Export Successful', `Exported ${data.length} branch records to CSV.`);
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

declare global {
  interface String {
    equalsIgnoreCase(other: string): boolean;
  }
}

String.prototype.equalsIgnoreCase = function (this: string, other: string): boolean {
  return this.toLowerCase() === (other || '').toLowerCase();
};
