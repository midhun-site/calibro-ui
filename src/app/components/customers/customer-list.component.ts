import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerService } from '../../services/customer.service';
import { CountryService } from '../../services/country.service';
import { ToastService } from '../../services/toast.service';
import type {
  Customer,
  CustomerContact,
  SaveCustomerPayload,
  CustomerCategoryLookup,
  CountryLookup
} from '../../models/customer.model';

/**
 * Customer Master Component managing the laboratory customer directory,
 * contact persons, search filters, sorting, server/client pagination, CSV export, and CRUD modals.
 * Implements lazy API loading pattern for categories, countries, and explicit control-level validation labels.
 */
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private countryService = inject(CountryService);
  private toastService = inject(ToastService);
  protected Math = Math;

  // ── Reactive Signals & State ─────────────────────────────────────────────
  public customers = this.customerService.customers;
  public categories = this.customerService.categories;
  public countries = this.countryService.countries;
  public isLoading = this.customerService.isLoading;
  public isSaving = signal<boolean>(false);

  // Validation State
  public formSubmitted = signal<boolean>(false);
  public touchedFields = signal<{ [key: string]: boolean }>({});

  // Column Filters
  public filters = signal<{ [key: string]: string }>({
    code: '',
    companyName: '',
    email: '',
    phone: '',
    city: '',
    customerCategoryName: ''
  });

  // Sort State
  public sortColumn = signal<keyof Customer>('code');
  public sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination State
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(10);

  // Modal State
  public showModal = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public showDeleteModal = signal<boolean>(false);
  public targetCustomer = signal<Customer | null>(null);

  // Form Model State
  public formCustomer = signal<SaveCustomerPayload>({
    id: null,
    code: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    taxNumber: '',
    customerCategoryId: null,
    contacts: []
  });

  public formContacts = signal<CustomerContact[]>([]);

  // ── Computed Filtered, Sorted & Paginated Data ───────────────────────────
  public filteredData = computed(() => {
    const list = this.customers();
    const f = this.filters();

    return list.filter(item => {
      const matchCode = !f['code'] || item.code.toLowerCase().includes(f['code'].toLowerCase());
      const matchCompany = !f['companyName'] || item.companyName.toLowerCase().includes(f['companyName'].toLowerCase());
      const matchEmail = !f['email'] || item.email.toLowerCase().includes(f['email'].toLowerCase());
      const matchPhone = !f['phone'] || item.phone.toLowerCase().includes(f['phone'].toLowerCase());
      const matchCity = !f['city'] || ((item.city || '') + ' ' + (item.country || '')).toLowerCase().includes(f['city'].toLowerCase());
      const matchCategory = !f['customerCategoryName'] || (item.customerCategoryName || '').toLowerCase().includes(f['customerCategoryName'].toLowerCase());

      return matchCode && matchCompany && matchEmail && matchPhone && matchCity && matchCategory;
    });
  });

  public sortedData = computed(() => {
    const data = [...this.filteredData()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return data.sort((a, b) => {
      const valA = String((a as any)[col] ?? '').toLowerCase();
      const valB = String((b as any)[col] ?? '').toLowerCase();
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  public totalPages = computed(() => Math.ceil(this.sortedData().length / this.pageSize()) || 1);

  public paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.sortedData().slice(start, start + this.pageSize());
  });

  public pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  // ── Lifecycle & API Integration ──────────────────────────────────────────
  ngOnInit(): void {
    // Only load the primary customer directory on page init (Lazy Loading standard)
    this.loadCustomers();
  }

  /**
   * Fetches customer list from backend database.
   */
  public loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: res => {
        if (res && res.items) {
          this.customerService.customers.set(res.items);
        }
      },
      error: () => {}
    });
  }

  /**
   * Lazily loads customer classification categories on demand when modal opens.
   * Caches in reactive signal to avoid duplicate redundant network calls.
   * @param callback Optional callback invoked after categories are available.
   */
  public ensureCategoriesLoaded(callback?: () => void): void {
    if (this.categories().length > 0) {
      if (callback) callback();
      return;
    }

    this.customerService.getCustomerCategories().subscribe({
      next: cats => {
        if (cats && cats.length > 0) {
          this.customerService.categories.set(cats);
        }
        if (callback) callback();
      },
      error: () => {
        if (callback) callback();
      }
    });
  }

  /**
   * Lazily loads country reference data on demand when modal opens.
   * Caches in reactive signal to avoid duplicate network requests.
   * @param callback Optional callback invoked after countries are available.
   */
  public ensureCountriesLoaded(callback?: () => void): void {
    if (this.countries().length > 0) {
      if (callback) callback();
      return;
    }

    this.countryService.getCountries().subscribe({
      next: list => {
        if (list && list.length > 0) {
          this.countryService.countries.set(list);
        }
        if (callback) callback();
      },
      error: () => {
        if (callback) callback();
      }
    });
  }

  // ── Control-Level Validation Helpers ─────────────────────────────────────
  /**
   * Flags a field as visited by the user.
   */
  public markFieldTouched(fieldName: string): void {
    this.touchedFields.update(t => ({ ...t, [fieldName]: true }));
  }

  /**
   * Validates if a specific field has unmet validation constraints.
   */
  public isFieldInvalid(fieldName: string): boolean {
    const isTouched = this.touchedFields()[fieldName] || this.formSubmitted();
    if (!isTouched) return false;

    const form = this.formCustomer();
    switch (fieldName) {
      case 'code':
        return !form.code || !form.code.trim();
      case 'companyName':
        return !form.companyName || !form.companyName.trim();
      case 'email':
        return !form.email || !form.email.trim() || !this.isValidEmail(form.email);
      case 'phone':
        return !form.phone || !form.phone.trim();
      default:
        return false;
    }
  }

  /**
   * Returns human-readable validation error message for a given field.
   */
  public getFieldError(fieldName: string): string {
    const form = this.formCustomer();
    switch (fieldName) {
      case 'code':
        return (!form.code || !form.code.trim()) ? 'Customer Code is required.' : '';
      case 'companyName':
        return (!form.companyName || !form.companyName.trim()) ? 'Company Legal Name is required.' : '';
      case 'email':
        if (!form.email || !form.email.trim()) return 'Business Email is required.';
        if (!this.isValidEmail(form.email)) return 'Please enter a valid email address (e.g. name@company.ae).';
        return '';
      case 'phone':
        return (!form.phone || !form.phone.trim()) ? 'Business Phone is required.' : '';
      default:
        return '';
    }
  }

  /**
   * Validates email format pattern.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // ── Grid Filtering & Sorting Handlers ────────────────────────────────────
  public updateFilter(col: string, val: string): void {
    this.filters.update(f => ({ ...f, [col]: val }));
    this.currentPage.set(1);
  }

  public toggleSort(col: keyof Customer): void {
    if (this.sortColumn() === col) {
      this.sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  public getSortIcon(col: keyof Customer): string {
    if (this.sortColumn() !== col) return 'pi-sort-alt';
    return this.sortDirection() === 'asc'
      ? 'pi-sort-amount-up-alt text-cyan'
      : 'pi-sort-amount-down text-cyan';
  }

  public goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  public prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  public nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  // ── CRUD Modal Handlers ──────────────────────────────────────────────────
  /**
   * Handles Category Dropdown change event.
   */
  public onCategoryChange(val: any): void {
    const numVal = (val !== null && val !== undefined && val !== '' && val !== 'null') ? parseInt(val, 10) : null;
    this.formCustomer.update(c => ({
      ...c,
      customerCategoryId: numVal
    }));
  }

  /**
   * Handles Country Dropdown change event.
   */
  public onCountryChange(val: string): void {
    this.formCustomer.update(c => ({
      ...c,
      country: val || ''
    }));
  }

  /**
   * Computes the next unique customer identifier code based on highest numeric suffix.
   */
  private generateNextCustomerCode(): string {
    let maxNumber = 1000;
    for (const c of this.customers()) {
      if (c.code && c.code.toUpperCase().startsWith('CUST-')) {
        const num = parseInt(c.code.replace(/CUST-/i, ''), 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    return `CUST-${maxNumber + 1}`;
  }

  /**
   * Opens modal in Create mode with clean initial state and auto-generated customer code.
   * Lazily loads category and country lookups on demand.
   */
  public openAddModal(): void {
    this.isEditMode.set(false);
    this.formSubmitted.set(false);
    this.touchedFields.set({});

    const generatedCode = this.generateNextCustomerCode();

    this.formCustomer.set({
      id: null,
      code: generatedCode,
      companyName: '',
      email: '',
      phone: '',
      address: '',
      city: 'Dubai',
      country: 'United Arab Emirates',
      taxNumber: '',
      customerCategoryId: this.categories().length > 0 ? this.categories()[0].id : null,
      contacts: []
    });

    this.formContacts.set([
      { firstName: '', lastName: '', email: '', phone: '', position: 'Primary Contact', isPrimary: true }
    ]);

    // Lazy load categories only upon modal trigger
    this.ensureCategoriesLoaded(() => {
      if (!this.formCustomer().customerCategoryId && this.categories().length > 0) {
        this.formCustomer.update(c => ({
          ...c,
          customerCategoryId: this.categories()[0].id
        }));
      }
    });

    // Lazy load countries only upon modal trigger
    this.ensureCountriesLoaded();

    this.showModal.set(true);
  }

  /**
   * Opens modal in Edit mode, pre-populating customer attributes and fetching full contact details.
   * Lazily loads category and country lookups on demand.
   */
  public openEditModal(customer: Customer): void {
    this.isEditMode.set(true);
    this.formSubmitted.set(false);
    this.touchedFields.set({});
    this.targetCustomer.set(customer);

    const custId = typeof customer.id === 'string' ? parseInt(customer.id, 10) : customer.id;

    // Match category ID by numeric value or fallback by category name
    let catId = customer.customerCategoryId || null;
    if (!catId && customer.customerCategoryName) {
      const match = this.categories().find(c =>
        c.name.toLowerCase().includes(customer.customerCategoryName!.toLowerCase()) ||
        customer.customerCategoryName!.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) catId = match.id;
    }

    this.formCustomer.set({
      id: custId,
      code: customer.code,
      companyName: customer.companyName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || 'United Arab Emirates',
      taxNumber: customer.taxNumber || '',
      customerCategoryId: catId,
      contacts: []
    });

    // Lazy load categories upon opening edit modal
    this.ensureCategoriesLoaded(() => {
      if (!this.formCustomer().customerCategoryId && customer.customerCategoryName) {
        const match = this.categories().find(c =>
          c.name.toLowerCase().includes(customer.customerCategoryName!.toLowerCase()) ||
          customer.customerCategoryName!.toLowerCase().includes(c.name.toLowerCase())
        );
        if (match) {
          this.formCustomer.update(c => ({ ...c, customerCategoryId: match.id }));
        }
      }
    });

    // Lazy load countries upon opening edit modal
    this.ensureCountriesLoaded();

    // Lazy fetch full customer details including contacts
    if (custId && custId > 0) {
      this.customerService.getCustomerById(custId).subscribe({
        next: details => {
          if (details && details.contacts && details.contacts.length > 0) {
            this.formContacts.set(details.contacts);
          } else {
            this.formContacts.set([
              { firstName: '', lastName: '', email: customer.email, phone: customer.phone, position: 'Primary Contact', isPrimary: true }
            ]);
          }
        },
        error: () => {
          this.formContacts.set([
            { firstName: '', lastName: '', email: customer.email, phone: customer.phone, position: 'Primary Contact', isPrimary: true }
          ]);
        }
      });
    } else {
      this.formContacts.set([
        { firstName: '', lastName: '', email: customer.email, phone: customer.phone, position: 'Primary Contact', isPrimary: true }
      ]);
    }

    this.showModal.set(true);
  }

  /**
   * Adds a new contact person row to the dynamic sub-form.
   */
  public addContactRow(): void {
    this.formContacts.update(list => [
      ...list,
      { firstName: '', lastName: '', email: '', phone: '', position: '', isPrimary: list.length === 0 }
    ]);
  }

  /**
   * Removes a contact person row by index.
   */
  public removeContactRow(index: number): void {
    this.formContacts.update(list => list.filter((_, i) => i !== index));
  }

  /**
   * Designates a specific contact row as the primary representative.
   */
  public setPrimaryContact(index: number): void {
    this.formContacts.update(list =>
      list.map((c, i) => ({ ...c, isPrimary: i === index }))
    );
  }

  /**
   * Validates and persists customer creation or modification.
   */
  public saveCustomer(): void {
    this.formSubmitted.set(true);

    if (
      this.isFieldInvalid('code') ||
      this.isFieldInvalid('companyName') ||
      this.isFieldInvalid('email') ||
      this.isFieldInvalid('phone')
    ) {
      this.toastService.showWarning(
        'Validation Required',
        'Please correct the highlighted errors before saving.'
      );
      return;
    }

    const form = this.formCustomer();

    // Filter valid contact rows
    const validContacts = this.formContacts().filter(c => c.firstName.trim().length > 0);

    const payload: SaveCustomerPayload = {
      ...form,
      contacts: validContacts
    };

    this.isSaving.set(true);

    this.customerService.saveCustomer(payload).subscribe({
      next: res => {
        this.isSaving.set(false);
        this.showModal.set(false);
        this.toastService.showSuccess(
          this.isEditMode() ? 'Customer Updated' : 'Customer Created',
          res.message || `${form.companyName} saved successfully.`
        );
        this.loadCustomers();
      },
      error: err => {
        this.isSaving.set(false);
        const errMsg = err.error?.detail || err.error?.message || err.message || 'Failed to save customer account.';
        this.toastService.showError('Save Failed', errMsg);
      }
    });
  }

  /**
   * Prompts user with delete confirmation modal.
   */
  public promptDelete(customer: Customer): void {
    this.targetCustomer.set(customer);
    this.showDeleteModal.set(true);
  }

  /**
   * Executes customer soft-delete upon confirmation.
   */
  public executeDelete(): void {
    const customer = this.targetCustomer();
    if (!customer) return;

    const custId = typeof customer.id === 'string' ? parseInt(customer.id, 10) : customer.id;

    if (!custId || custId <= 0) {
      this.customerService.customers.update(list => list.filter(c => c.code !== customer.code));
      this.showDeleteModal.set(false);
      this.toastService.showSuccess('Customer Deleted', `${customer.companyName} removed.`);
      return;
    }

    this.isSaving.set(true);
    this.customerService.deleteCustomer(custId).subscribe({
      next: res => {
        this.isSaving.set(false);
        this.showDeleteModal.set(false);
        this.toastService.showSuccess('Customer Deleted', res.message || `${customer.companyName} soft-deleted.`);
        this.loadCustomers();
      },
      error: err => {
        this.isSaving.set(false);
        const errMsg = err.error?.detail || err.error?.message || 'Failed to delete customer.';
        this.toastService.showError('Delete Failed', errMsg);
      }
    });
  }

  /**
   * Exports filtered & sorted customer directory to CSV.
   */
  public exportToCsv(): void {
    const data = this.sortedData();
    if (data.length === 0) {
      this.toastService.showWarning('Export Warning', 'No customer records available to export.');
      return;
    }

    const headers = [
      'Customer Code',
      'Company Name',
      'Category',
      'Email',
      'Phone',
      'City',
      'Country',
      'Tax / TRN Number',
      'Total Contacts',
      'Total Equipments',
      'Active Work Orders'
    ];

    const rows = data.map(d => [
      `"${d.code}"`,
      `"${d.companyName}"`,
      `"${d.customerCategoryName || 'Standard'}"`,
      `"${d.email}"`,
      `"${d.phone}"`,
      `"${d.city}"`,
      `"${d.country}"`,
      `"${d.taxNumber || ''}"`,
      d.totalContacts || 0,
      d.totalEquipments || 0,
      d.activeWorkOrders || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Customer_Master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toastService.showSuccess('Export Successful', `Exported ${data.length} customer records to CSV.`);
  }
}
