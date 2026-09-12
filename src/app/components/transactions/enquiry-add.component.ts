import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';
import { CustomerService } from '../../services/customer.service';
import { LookupService } from '../../services/lookup.service';
import { EnquiryService } from '../../services/enquiry.service';
import { CustomerLookupModalComponent } from '../common/customer-lookup-modal/customer-lookup-modal.component';
import { ItemLookupModalComponent, SelectedItemPayload } from '../common/item-lookup-modal/item-lookup-modal.component';
import type { Customer, CustomerContact, CustomerDetails } from '../../models/customer.model';
import type { EnquiryDetail, EnquiryItemDetail, CreateEnquiryPayload, UpdateEnquiryPayload } from '../../models/enquiry.model';

export interface EnquiryItemRow {
  id?: number;
  slNo: number;
  itemId?: number | null;
  itemCode?: string;
  itemName: string;
  serialNo: string;
  roTagNo: string;
  make: string;
  model: string;
  range: string;
  qty: number;
  remarks?: string;
}

/**
 * Component for creating and editing Calibration Enquiries.
 * Features integration with Customer Master and Item Master via server-side paginated lookup popups,
 * multi-select equipment addition, automatic contact/address population, and dynamic item rows specification grid.
 */
@Component({
  selector: 'app-enquiry-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CustomerLookupModalComponent,
    ItemLookupModalComponent
  ],
  templateUrl: './enquiry-add.component.html',
  styleUrl: './enquiry-add.component.css'
})
export class EnquiryAddComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private customerService = inject(CustomerService);
  private lookupService = inject(LookupService);
  private enquiryService = inject(EnquiryService);

  public isEditMode = false;
  public numericId: number | null = null;
  public isSubmitting = signal<boolean>(false);

  // Customer Lookup Modal & Selection State
  public showCustomerLookup = signal<boolean>(false);
  public selectedCustomer = signal<Customer | null>(null);
  public customerContacts = signal<CustomerContact[]>([]);
  public selectedContactId = signal<number | null>(null);

  // Item Master Lookup Modal State
  public showItemLookup = signal<boolean>(false);

  // Pipeline Stages, Enquiry Natures & Modes from Lookup API
  public pipelineStages = this.lookupService.pipelineStages;
  public enquiryNatures = this.lookupService.enquiryNatures;
  public enquiryModes = this.lookupService.enquiryModes;

  public enquiry = {
    enqNo: '',
    modeId: null as number | null,
    mode: 'Mail',
    natureId: null as number | null,
    nature: 'Calibration (CAL)',
    statusId: null as number | null,
    status: 'New Enquiry',
    customerId: null as number | string | null,
    customerCode: '',
    client: '',
    address: '',
    poBox: '',
    contactPersonId: null as number | null,
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
    revDate: '',
    remarks: ''
  };

  public items: EnquiryItemRow[] = [];

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    const idParam = this.route.snapshot.paramMap.get('id');

    // Lazily load pipeline stages, enquiry natures, and enquiry modes from Lookup API
    this.lookupService.ensurePipelineStagesLoaded();
    this.lookupService.ensureEnquiryNaturesLoaded();
    this.lookupService.ensureEnquiryModesLoaded();

    if (idParam) {
      this.isEditMode = true;
      this.loadEnquiryForEdit(idParam, today);
    } else {
      this.isEditMode = false;
      this.enquiry.enqDate = today;
      this.enquiry.revNo = '00';
      this.enquiry.revDate = today;
      this.enquiry.status = 'New Enquiry';
      this.items = [];

      // Query next sequential enquiry number from backend
      this.enquiryService.getNextEnquiryNo().subscribe({
        next: res => {
          if (res?.nextEnquiryNo) {
            this.enquiry.enqNo = res.nextEnquiryNo;
          }
        },
        error: () => {
          const randomNum = Math.floor(100 + Math.random() * 900);
          this.enquiry.enqNo = `ENQ-${new Date().getFullYear()}-${randomNum}`;
        }
      });
    }
  }

  /**
   * Loads existing enquiry details and equipment line items from backend for edit mode.
   * @param idParam Numeric ID or EnquiryNo from route params.
   * @param today Today's ISO date string.
   */
  private loadEnquiryForEdit(idParam: string, today: string): void {
    const isNumeric = /^\d+$/.test(idParam);
    const fetch$ = isNumeric
      ? this.enquiryService.getEnquiryById(parseInt(idParam, 10))
      : this.enquiryService.getEnquiryByNumber(idParam);

    fetch$.subscribe({
      next: (detail: EnquiryDetail) => {
        this.numericId = detail.id;
        this.enquiry.enqNo = detail.enquiryNo;
        this.enquiry.mode = detail.mode || 'Mail';
        this.enquiry.modeId = detail.modeId || null;
        this.enquiry.nature = detail.nature || 'Calibration (CAL)';
        this.enquiry.natureId = detail.natureId || null;
        this.enquiry.status = detail.status || 'New Enquiry';
        this.enquiry.statusId = detail.statusId || null;
        this.enquiry.customerId = detail.customerId || null;
        this.enquiry.customerCode = detail.customerCode || '';
        this.enquiry.client = detail.clientName || '';
        this.enquiry.address = detail.address || '';
        this.enquiry.poBox = detail.poBox || '';
        this.enquiry.contactPersonId = detail.contactPersonId || null;
        this.enquiry.contactPerson = detail.contactPersonName || '';
        this.enquiry.email = detail.email || '';
        this.enquiry.telNo = detail.telNo || '';
        this.enquiry.fax = detail.fax || '';
        this.enquiry.designation = detail.designation || '';
        this.enquiry.department = detail.department || '';
        this.enquiry.reference = detail.reference || '';
        this.enquiry.forTcp = detail.forTcp || false;
        this.enquiry.remarks = detail.remarks || '';
        this.enquiry.enqDate = detail.enqDate ? detail.enqDate.toString().split('T')[0] : today;

        // Auto-increment revision on edit (e.g. 00 -> 01, 01 -> 02)
        const currentRevNumber = parseInt(detail.revNo || '00', 10);
        this.enquiry.revNo = (currentRevNumber + 1).toString().padStart(2, '0');
        this.enquiry.revDate = today;

        this.items = (detail.items || []).map((i, idx) => ({
          id: i.id,
          slNo: i.slNo || (idx + 1),
          itemId: i.itemId,
          itemCode: i.itemCode,
          itemName: i.itemName,
          serialNo: i.serialNo || '',
          roTagNo: i.roTagNo || '',
          make: i.make || '',
          model: i.model || '',
          range: i.range || '',
          qty: i.qty || 1,
          remarks: i.remarks
        }));

        // Load contact persons if customer exists
        if (detail.customerId) {
          const custId = typeof detail.customerId === 'string' ? parseInt(detail.customerId, 10) : detail.customerId;
          this.customerService.getCustomerById(custId).subscribe({
            next: (cust: CustomerDetails) => {
              if (cust?.contacts && cust.contacts.length > 0) {
                this.customerContacts.set(cust.contacts);
                if (detail.contactPersonId) {
                  this.selectedContactId.set(detail.contactPersonId);
                } else if (detail.contactPersonName) {
                  const matching = cust.contacts.find(c => `${c.firstName} ${c.lastName}`.trim().toLowerCase() === detail.contactPersonName?.trim().toLowerCase());
                  if (matching && matching.id !== undefined) {
                    this.selectedContactId.set(matching.id);
                  }
                }
              }
            }
          });
        }
      },
      error: () => {
        this.toastService.showError('Load Error', `Could not find enquiry record ${idParam}.`);
        this.router.navigate(['/transactions/enquiry']);
      }
    });
  }

  // ── Customer Lookup Methods ─────────────────────────────────────────────
  public openCustomerLookup(): void {
    this.showCustomerLookup.set(true);
  }

  public closeCustomerLookup(): void {
    this.showCustomerLookup.set(false);
  }

  public onCustomerSelected(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.enquiry.customerId = customer.id;
    this.enquiry.customerCode = customer.code;
    this.enquiry.client = customer.companyName;

    const addrParts = [customer.address, customer.city, customer.country].filter(Boolean);
    this.enquiry.address = addrParts.join(', ');
    this.enquiry.poBox = customer.taxNumber || '';
    this.enquiry.email = customer.email || '';
    this.enquiry.telNo = customer.phone || '';

    this.customerContacts.set([]);
    this.selectedContactId.set(null);

    const custId = typeof customer.id === 'string' ? parseInt(customer.id, 10) : customer.id;
    if (custId && custId > 0) {
      this.customerService.getCustomerById(custId).subscribe({
        next: (details: CustomerDetails) => {
          if (details?.contacts && details.contacts.length > 0) {
            this.customerContacts.set(details.contacts);
            const primary = details.contacts.find(c => c.isPrimary) || details.contacts[0];
            if (primary) {
              this.applyContactDetails(primary);
            }
          }
        }
      });
    }

    this.toastService.showSuccess('Customer Selected', `${customer.companyName} linked to this enquiry.`);
  }

  public onContactSelectionChange(contactId: number | null): void {
    this.selectedContactId.set(contactId);
    this.onContactChange();
  }

  public onContactChange(): void {
    const contactId = this.selectedContactId();
    if (!contactId) return;

    const contact = this.customerContacts().find(c => c.id === contactId);
    if (contact) {
      this.applyContactDetails(contact);
    }
  }

  private applyContactDetails(contact: CustomerContact): void {
    this.selectedContactId.set(contact.id ?? null);
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    this.enquiry.contactPerson = fullName;
    this.enquiry.email = contact.email || this.enquiry.email;
    this.enquiry.telNo = contact.phone || this.enquiry.telNo;
    this.enquiry.designation = contact.position || '';
  }

  public clearCustomer(): void {
    this.selectedCustomer.set(null);
    this.enquiry.customerId = null;
    this.enquiry.customerCode = '';
    this.enquiry.client = '';
    this.enquiry.address = '';
    this.enquiry.poBox = '';
    this.enquiry.contactPerson = '';
    this.enquiry.email = '';
    this.enquiry.telNo = '';
    this.enquiry.fax = '';
    this.enquiry.designation = '';
    this.enquiry.department = '';
    this.customerContacts.set([]);
    this.selectedContactId.set(null);
  }

  // ── Item Master Lookup & Specification Methods ─────────────────────────
  public openItemLookup(): void {
    this.showItemLookup.set(true);
  }

  public closeItemLookup(): void {
    this.showItemLookup.set(false);
  }

  public onItemsSelected(selectedList: SelectedItemPayload[]): void {
    if (!selectedList || selectedList.length === 0) return;

    for (const itemPayload of selectedList) {
      const item = itemPayload.item;
      const nextSlNo = this.items.length + 1;

      this.items.push({
        slNo: nextSlNo,
        itemId: item.id || null,
        itemCode: item.itemCode || '',
        itemName: item.itemName || 'Standard Unit',
        serialNo: '',
        roTagNo: '',
        make: item.supplier || '',
        model: item.modelNo || '',
        range: '',
        qty: itemPayload.qty > 0 ? itemPayload.qty : 1
      });
    }

    this.toastService.showSuccess(
      'Items Added',
      `${selectedList.length} item(s) added to enquiry specification grid.`
    );
  }

  /**
   * Placeholder handler for importing items from CSV/Excel file.
   */
  public importItems(): void {
    this.toastService.showInfo(
      'Import Items',
      'Item batch import wizard will be configured in the next update.'
    );
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
    this.items.forEach((item, idx) => {
      item.slNo = idx + 1;
    });
  }

  /**
   * Commits the enquiry to the backend database via POST (create) or PUT (update).
   */
  saveEnquiry() {
    if (!this.enquiry.client || !this.enquiry.client.trim()) {
      this.toastService.showWarning('Client Required', 'Please select a customer from the customer master.');
      return;
    }

    const hasValidItems = this.items.some(i => i.itemName && i.itemName.trim().length > 0);
    if (!hasValidItems) {
      this.toastService.showWarning('Items Required', 'Please add at least 1 item to the enquiry specification.');
      return;
    }

    this.isSubmitting.set(true);

    const selectedMode = this.enquiryModes().find(m => m.name.toLowerCase() === (this.enquiry.mode || '').toLowerCase());
    const selectedNature = this.enquiryNatures().find(n => n.name.toLowerCase() === (this.enquiry.nature || '').toLowerCase());
    const selectedStatus = this.pipelineStages().find(s => s.name.toLowerCase() === (this.enquiry.status || '').toLowerCase());

    const custId = this.enquiry.customerId
      ? (typeof this.enquiry.customerId === 'string' ? parseInt(this.enquiry.customerId, 10) : this.enquiry.customerId)
      : null;

    const contactId = this.selectedContactId()
      ? (typeof this.selectedContactId() === 'string' ? parseInt(this.selectedContactId() as any, 10) : this.selectedContactId())
      : null;

    const itemsPayload: EnquiryItemDetail[] = this.items.map((i, idx) => ({
      id: i.id,
      slNo: idx + 1,
      itemId: i.itemId || null,
      itemCode: i.itemCode,
      itemName: i.itemName,
      serialNo: i.serialNo,
      roTagNo: i.roTagNo,
      make: i.make,
      model: i.model,
      range: i.range,
      qty: i.qty > 0 ? i.qty : 1,
      remarks: i.remarks
    }));

    if (this.isEditMode) {
      const idToUpdate = this.numericId || this.enquiry.enqNo;
      const updatePayload: UpdateEnquiryPayload = {
        id: this.numericId || 0,
        enquiryNo: this.enquiry.enqNo,
        revNo: this.enquiry.revNo,
        revDate: this.enquiry.revDate,
        modeId: selectedMode?.id || this.enquiry.modeId || null,
        mode: this.enquiry.mode,
        natureId: selectedNature?.id || this.enquiry.natureId || null,
        nature: this.enquiry.nature,
        statusId: selectedStatus?.id || this.enquiry.statusId || null,
        status: this.enquiry.status,
        customerId: custId,
        customerCode: this.enquiry.customerCode,
        clientName: this.enquiry.client,
        address: this.enquiry.address,
        poBox: this.enquiry.poBox,
        contactPersonId: contactId,
        contactPersonName: this.enquiry.contactPerson,
        email: this.enquiry.email,
        telNo: this.enquiry.telNo,
        fax: this.enquiry.fax,
        designation: this.enquiry.designation,
        department: this.enquiry.department,
        reference: this.enquiry.reference,
        forTcp: this.enquiry.forTcp,
        remarks: this.enquiry.remarks,
        items: itemsPayload
      };

      this.enquiryService.updateEnquiry(idToUpdate, updatePayload).subscribe({
        next: res => {
          this.isSubmitting.set(false);
          this.toastService.showSuccess(
            'Enquiry Updated',
            res?.message || `Calibration Enquiry ${this.enquiry.enqNo} (Rev ${this.enquiry.revNo}) updated successfully.`
          );
          this.router.navigate(['/transactions/enquiry']);
        },
        error: err => {
          this.isSubmitting.set(false);
          this.toastService.showError('Update Failed', err?.error?.detail || err?.error?.message || 'An error occurred while updating enquiry.');
        }
      });
    } else {
      const createPayload: CreateEnquiryPayload = {
        enquiryNo: this.enquiry.enqNo,
        modeId: selectedMode?.id || null,
        mode: this.enquiry.mode,
        natureId: selectedNature?.id || null,
        nature: this.enquiry.nature,
        statusId: selectedStatus?.id || null,
        status: this.enquiry.status,
        customerId: custId,
        customerCode: this.enquiry.customerCode,
        clientName: this.enquiry.client,
        address: this.enquiry.address,
        poBox: this.enquiry.poBox,
        contactPersonId: contactId,
        contactPersonName: this.enquiry.contactPerson,
        email: this.enquiry.email,
        telNo: this.enquiry.telNo,
        fax: this.enquiry.fax,
        designation: this.enquiry.designation,
        department: this.enquiry.department,
        reference: this.enquiry.reference,
        forTcp: this.enquiry.forTcp,
        remarks: this.enquiry.remarks,
        items: itemsPayload
      };

      this.enquiryService.createEnquiry(createPayload).subscribe({
        next: res => {
          this.isSubmitting.set(false);
          this.toastService.showSuccess(
            'Enquiry Created',
            res?.message || `Calibration Enquiry ${res?.enquiryNo || this.enquiry.enqNo} created successfully.`
          );
          this.router.navigate(['/transactions/enquiry']);
        },
        error: err => {
          this.isSubmitting.set(false);
          this.toastService.showError('Creation Failed', err?.error?.detail || err?.error?.message || 'An error occurred while saving enquiry.');
        }
      });
    }
  }

  printEnquiry() {
    window.open('/transactions/enquiry/print/' + this.enquiry.enqNo, '_blank');
  }

  goBack() {
    this.router.navigate(['/transactions/enquiry']);
  }
}
