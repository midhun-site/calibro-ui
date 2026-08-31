import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerService } from '../../services/customer.service';
import { CountryService } from '../../services/country.service';
import { ToastService } from '../../services/toast.service';
import { DataGridState } from '../../common/grid';
import type {
  Customer,
  CustomerContact,
  SaveCustomerPayload,
  CustomerCategoryLookup,
  CountryLookup
} from '../../models/customer.model';

/**
 * Customer Master Component managing the laboratory customer directory,
 * contact persons, server-side search filters, sorting, server-side pagination, CSV export,
 * reactive CRUD modal forms, and dirty checking with unsaved changes confirmation.
 */
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private countryService = inject(CountryService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  protected Math = Math;

  // ── Database-Backed Server-Side DataGridState ───────────────────────────
  public customerGrid = new DataGridState<Customer>({
    defaultSortColumn: 'code',
    defaultSortDirection: 'asc',
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    columns: [
      { header: 'Customer ID', field: 'code' },
      { header: 'Company Name', field: 'companyName' },
      { header: 'Category', field: (c) => c.customerCategoryName || 'Standard' },
      { header: 'Contact Email', field: 'email' },
      { header: 'Phone', field: 'phone' },
      { header: 'City / Country', field: (c) => `${c.city || ''}, ${c.country || ''}` },
      { header: 'Tax / TRN', field: 'taxNumber' },
      { header: 'Contacts', field: (c) => c.totalContacts || 1 }
    ],
    fetchFn: (params) => this.customerService.getCustomers(params)
  });

  // ── Reactive Signals & State ─────────────────────────────────────────────
  public categories = this.customerService.categories;
  public countries = this.countryService.countries;
  public isSaving = signal<boolean>(false);

  // Modal State
  public showModal = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public showDeleteModal = signal<boolean>(false);
  public targetCustomer = signal<Customer | null>(null);

  // Validation & Dirty State Tracking
  public formSubmitted = signal<boolean>(false);
  public showUnsavedConfirmModal = signal<boolean>(false);
  private initialFormSnapshot: string = '';

  // ── Complex Reactive Form Definition ─────────────────────────────────────
  public customerForm: FormGroup = this.fb.group({
    id: [null],
    code: ['', [Validators.required, Validators.maxLength(50)]],
    companyName: ['', [Validators.required, Validators.maxLength(200)]],
    customerCategoryId: [null],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.required, Validators.maxLength(50)]],
    taxNumber: ['', [Validators.maxLength(50)]],
    address: ['', [Validators.maxLength(500)]],
    city: ['Dubai', [Validators.maxLength(100)]],
    country: ['United Arab Emirates', [Validators.maxLength(100)]],
    contacts: this.fb.array([])
  });

  /**
   * Helper accessor for contact persons FormArray.
   */
  public get contactsArray(): FormArray {
    return this.customerForm.get('contacts') as FormArray;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Initial server-side grid load
    this.customerGrid.load();
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

  // ── Dirty State & Unsaved Confirmation Tracking ──────────────────────────
  /**
   * Captures a normalized snapshot of the form state to detect subsequent edits.
   */
  private captureInitialSnapshot(): void {
    this.initialFormSnapshot = JSON.stringify(this.customerForm.getRawValue());
  }

  /**
   * Determines if the user has modified any form field or contact row.
   */
  public isFormDirty(): boolean {
    if (!this.initialFormSnapshot) return false;
    return this.initialFormSnapshot !== JSON.stringify(this.customerForm.getRawValue());
  }

  /**
   * Requests modal closure, intercepting with a confirmation dialog if dirty.
   */
  public requestCloseModal(): void {
    if (this.isFormDirty()) {
      this.showUnsavedConfirmModal.set(true);
    } else {
      this.forceCloseModal();
    }
  }

  /**
   * Confirms discarding unsaved changes and closes the modal.
   */
  public discardAndClose(): void {
    this.showUnsavedConfirmModal.set(false);
    this.forceCloseModal();
  }

  /**
   * Dismisses the unsaved changes warning dialog to continue editing.
   */
  public keepEditing(): void {
    this.showUnsavedConfirmModal.set(false);
  }

  /**
   * Closes the modal and resets dirty and validation tracking flags.
   */
  private forceCloseModal(): void {
    this.showModal.set(false);
    this.formSubmitted.set(false);
    this.customerForm.reset();
    this.contactsArray.clear();
    this.initialFormSnapshot = '';
  }

  // ── Control-Level Validation Helpers ─────────────────────────────────────
  /**
   * Checks whether a form control is invalid and touched/submitted.
   */
  public isFieldInvalid(controlName: string): boolean {
    const control = this.customerForm.get(controlName);
    if (!control) return false;
    return control.invalid && (control.touched || control.dirty || this.formSubmitted());
  }

  /**
   * Returns human-readable validation error message for a given control.
   */
  public getFieldError(controlName: string): string {
    const control = this.customerForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      switch (controlName) {
        case 'code': return 'Customer ID is required.';
        case 'companyName': return 'Company Legal Name is required.';
        case 'email': return 'Business Email is required.';
        case 'phone': return 'Business Phone is required.';
        default: return 'This field is required.';
      }
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address (e.g. name@company.ae).';
    }
    return '';
  }

  // ── Contact Sub-form Helpers ─────────────────────────────────────────────
  /**
   * Creates a FormGroup for a single customer contact person.
   */
  private createContactGroup(contact?: Partial<CustomerContact>): FormGroup {
    return this.fb.group({
      firstName: [contact?.firstName || '', Validators.required],
      lastName: [contact?.lastName || ''],
      email: [contact?.email || ''],
      phone: [contact?.phone || ''],
      position: [contact?.position || 'Primary Contact'],
      isPrimary: [contact?.isPrimary ?? (this.contactsArray.length === 0)]
    });
  }

  /**
   * Adds a new contact person row to the FormArray.
   */
  public addContactRow(): void {
    this.contactsArray.push(this.createContactGroup({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      isPrimary: this.contactsArray.length === 0
    }));
  }

  /**
   * Removes a contact person row by index.
   */
  public removeContactRow(index: number): void {
    if (this.contactsArray.length > 1) {
      this.contactsArray.removeAt(index);
    }
  }

  /**
   * Designates a specific contact row as the primary representative.
   */
  public setPrimaryContact(index: number): void {
    for (let i = 0; i < this.contactsArray.length; i++) {
      const grp = this.contactsArray.at(i) as FormGroup;
      grp.patchValue({ isPrimary: i === index });
    }
  }

  // ── Sequential Code Generation ───────────────────────────────────────────
  private generateNextCustomerCode(): string {
    let maxNumber = 0;
    for (const c of this.customerGrid.items()) {
      if (c.code) {
        const match = c.code.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }
    const next = maxNumber + 1;
    return `CUST${next.toString().padStart(4, '0')}`;
  }

  // ── CRUD Handlers ────────────────────────────────────────────────────────
  /**
   * Opens modal in Create mode with clean initial state and retrieves next sequential customer code.
   */
  public openAddModal(): void {
    this.isEditMode.set(false);
    this.formSubmitted.set(false);
    this.customerForm.reset();
    this.contactsArray.clear();

    const initialCode = this.generateNextCustomerCode();

    this.customerForm.patchValue({
      id: null,
      code: initialCode,
      companyName: '',
      email: '',
      phone: '',
      address: '',
      city: 'Dubai',
      country: 'United Arab Emirates',
      taxNumber: '',
      customerCategoryId: this.categories().length > 0 ? this.categories()[0].id : null
    });

    this.contactsArray.push(this.createContactGroup({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: 'Primary Contact',
      isPrimary: true
    }));

    this.captureInitialSnapshot();

    // Fetch authoritative sequential customer code from API
    this.customerService.getNextCustomerCode().subscribe({
      next: res => {
        if (res && res.customerCode) {
          this.customerForm.patchValue({ code: res.customerCode });
          this.captureInitialSnapshot();
        }
      },
      error: () => {}
    });

    // Lazy load categories only upon modal trigger
    this.ensureCategoriesLoaded(() => {
      const currentCat = this.customerForm.get('customerCategoryId')?.value;
      if (!currentCat && this.categories().length > 0) {
        this.customerForm.patchValue({ customerCategoryId: this.categories()[0].id });
        this.captureInitialSnapshot();
      }
    });

    // Lazy load countries only upon modal trigger
    this.ensureCountriesLoaded();

    this.showModal.set(true);
  }

  /**
   * Opens modal in Edit mode, pre-populating customer attributes and fetching full contact details.
   */
  public openEditModal(customer: Customer): void {
    this.isEditMode.set(true);
    this.formSubmitted.set(false);
    this.customerForm.reset();
    this.contactsArray.clear();
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

    this.customerForm.patchValue({
      id: custId,
      code: customer.code,
      companyName: customer.companyName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || 'United Arab Emirates',
      taxNumber: customer.taxNumber || '',
      customerCategoryId: catId
    });

    // Initial contact row before full details arrive
    this.contactsArray.push(this.createContactGroup({
      firstName: '',
      lastName: '',
      email: customer.email,
      phone: customer.phone,
      position: 'Primary Contact',
      isPrimary: true
    }));

    this.captureInitialSnapshot();

    // Lazy load categories upon opening edit modal
    this.ensureCategoriesLoaded(() => {
      if (!this.customerForm.get('customerCategoryId')?.value && customer.customerCategoryName) {
        const match = this.categories().find(c =>
          c.name.toLowerCase().includes(customer.customerCategoryName!.toLowerCase()) ||
          customer.customerCategoryName!.toLowerCase().includes(c.name.toLowerCase())
        );
        if (match) {
          this.customerForm.patchValue({ customerCategoryId: match.id });
          this.captureInitialSnapshot();
        }
      }
    });

    // Lazy load countries
    this.ensureCountriesLoaded();

    // Fetch full customer details including contacts
    if (custId && custId > 0) {
      this.customerService.getCustomerById(custId).subscribe({
        next: details => {
          if (details && details.contacts && details.contacts.length > 0) {
            this.contactsArray.clear();
            for (const c of details.contacts) {
              this.contactsArray.push(this.createContactGroup(c));
            }
          }
          this.captureInitialSnapshot();
        },
        error: () => {
          this.captureInitialSnapshot();
        }
      });
    }

    this.showModal.set(true);
  }

  /**
   * Persists customer creation or modification using Reactive Form value.
   */
  public saveCustomer(): void {
    this.formSubmitted.set(true);

    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      this.toastService.showWarning(
        'Validation Required',
        'Please correct the highlighted errors before saving.'
      );
      return;
    }

    const formVal = this.customerForm.getRawValue();

    // Filter valid contact rows
    const contacts: CustomerContact[] = (formVal.contacts || []).filter(
      (c: any) => c.firstName && c.firstName.trim().length > 0
    );

    const payload: SaveCustomerPayload = {
      id: formVal.id,
      code: formVal.code,
      companyName: formVal.companyName,
      email: formVal.email,
      phone: formVal.phone,
      address: formVal.address,
      city: formVal.city,
      country: formVal.country,
      taxNumber: formVal.taxNumber,
      customerCategoryId: formVal.customerCategoryId ? parseInt(formVal.customerCategoryId, 10) : null,
      contacts
    };

    this.isSaving.set(true);

    this.customerService.saveCustomer(payload).subscribe({
      next: res => {
        this.isSaving.set(false);
        this.forceCloseModal();
        this.toastService.showSuccess(
          this.isEditMode() ? 'Customer Updated' : 'Customer Created',
          res.message || `${payload.companyName} saved successfully.`
        );
        this.customerGrid.load();
      },
      error: err => {
        this.isSaving.set(false);
        const errMsg = err.error?.detail || err.error?.message || err.message || 'Failed to save customer account.';
        this.toastService.showError('Save Failed', errMsg);
      }
    });
  }

  /**
   * Prompts delete confirmation modal.
   */
  public promptDelete(customer: Customer): void {
    this.targetCustomer.set(customer);
    this.showDeleteModal.set(true);
  }

  /**
   * Executes customer soft-delete.
   */
  public executeDelete(): void {
    const customer = this.targetCustomer();
    if (!customer) return;

    const custId = typeof customer.id === 'string' ? parseInt(customer.id, 10) : customer.id;

    if (!custId || custId <= 0) {
      this.customerGrid.load();
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
        this.customerGrid.load();
      },
      error: err => {
        this.isSaving.set(false);
        const errMsg = err.error?.detail || err.error?.message || 'Failed to delete customer.';
        this.toastService.showError('Delete Failed', errMsg);
      }
    });
  }
}
