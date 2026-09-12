import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { LookupItem, LookupType } from '../models/lookup.model';
import { environment } from '../../environments/environment';

/**
 * Service managing generic configurable lookup reference datasets from the backend REST API.
 */
@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** Default pipeline stages fallback in case of network or offline state */
  private readonly defaultPipelineStages: LookupItem[] = [
    { id: 1, name: 'New Enquiry', code: 'NEW_ENQUIRY', type: LookupType.PipelineStage, sortOrder: 1 },
    { id: 2, name: 'Reviewed', code: 'REVIEWED', type: LookupType.PipelineStage, sortOrder: 2 },
    { id: 3, name: 'Quotation Prepared', code: 'QUOTATION_PREPARED', type: LookupType.PipelineStage, sortOrder: 3 },
    { id: 4, name: 'Quotation Revised', code: 'QUOTATION_REVISED', type: LookupType.PipelineStage, sortOrder: 4 },
    { id: 5, name: 'Quotation Sent', code: 'QUOTATION_SENT', type: LookupType.PipelineStage, sortOrder: 5 },
    { id: 6, name: 'Delivery In', code: 'DELIVERY_IN', type: LookupType.PipelineStage, sortOrder: 6 },
    { id: 7, name: 'WorkOrder Created', code: 'WORKORDER_CREATED', type: LookupType.PipelineStage, sortOrder: 7 },
    { id: 8, name: 'Workorder Completed', code: 'WORKORDER_COMPLETED', type: LookupType.PipelineStage, sortOrder: 8 },
    { id: 9, name: 'Delivery Ticket Prepared', code: 'DELIVERY_TICKET_PREPARED', type: LookupType.PipelineStage, sortOrder: 9 },
    { id: 10, name: 'Invoice Prepared', code: 'INVOICE_PREPARED', type: LookupType.PipelineStage, sortOrder: 10 },
    { id: 11, name: 'Dispatched', code: 'DISPATCHED', type: LookupType.PipelineStage, sortOrder: 11 },
    { id: 12, name: 'Closed', code: 'CLOSED', type: LookupType.PipelineStage, sortOrder: 12 }
  ];

  /** Default enquiry nature types fallback in case of network or offline state */
  private readonly defaultEnquiryNatures: LookupItem[] = [
    { id: 1, name: 'Calibration (CAL)', code: 'CAL', type: LookupType.NatureOfEnquiry, sortOrder: 1 },
    { id: 2, name: 'Repair & Calibration', code: 'REPAIR_CAL', type: LookupType.NatureOfEnquiry, sortOrder: 2 },
    { id: 3, name: 'Site Inspection', code: 'INSPECTION', type: LookupType.NatureOfEnquiry, sortOrder: 3 },
    { id: 4, name: 'Material Testing', code: 'TESTING', type: LookupType.NatureOfEnquiry, sortOrder: 4 },
    { id: 5, name: 'Preventive Maintenance', code: 'MAINTENANCE', type: LookupType.NatureOfEnquiry, sortOrder: 5 },
    { id: 6, name: 'Supply & Commissioning', code: 'COMMISSIONING', type: LookupType.NatureOfEnquiry, sortOrder: 6 }
  ];

  /** Default enquiry mode types fallback (Verbal, Mail, Web, Fax, RRP) */
  private readonly defaultEnquiryModes: LookupItem[] = [
    { id: 1, name: 'Verbal', code: 'VERBAL', type: LookupType.EnquiryMode, sortOrder: 1 },
    { id: 2, name: 'Mail', code: 'MAIL', type: LookupType.EnquiryMode, sortOrder: 2 },
    { id: 3, name: 'Web', code: 'WEB', type: LookupType.EnquiryMode, sortOrder: 3 },
    { id: 4, name: 'Fax', code: 'FAX', type: LookupType.EnquiryMode, sortOrder: 4 },
    { id: 5, name: 'RRP', code: 'RRP', type: LookupType.EnquiryMode, sortOrder: 5 }
  ];

  /** Reactive cached signals for common lookup categories */
  public unitOfMeasures = signal<LookupItem[]>([]);
  public equipmentCategories = signal<LookupItem[]>([]);
  public priorityLevels = signal<LookupItem[]>([]);
  public pipelineStages = signal<LookupItem[]>(this.defaultPipelineStages);
  public enquiryNatures = signal<LookupItem[]>(this.defaultEnquiryNatures);
  public enquiryModes = signal<LookupItem[]>(this.defaultEnquiryModes);

  /**
   * Retrieves all active lookups matching the specified classification category type.
   * @param type Numeric enum value or string representation of LookupType.
   * @returns Observable resolving with the lookup collection.
   */
  getLookupsByType(type: LookupType | number | string): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.baseUrl}/lookups/by-type/${type}`).pipe(
      tap(items => {
        if (type === LookupType.UnitOfMeasure || type === 'UnitOfMeasure' || type === 1) {
          this.unitOfMeasures.set(items || []);
        } else if (type === LookupType.EquipmentCategory || type === 'EquipmentCategory' || type === 2) {
          this.equipmentCategories.set(items || []);
        } else if (type === LookupType.PriorityLevel || type === 'PriorityLevel' || type === 3) {
          this.priorityLevels.set(items || []);
        } else if (type === LookupType.PipelineStage || type === 'PipelineStage' || type === 5) {
          if (items && items.length > 0) {
            this.pipelineStages.set(items);
          }
        } else if (type === LookupType.NatureOfEnquiry || type === 'NatureOfEnquiry' || type === 6) {
          if (items && items.length > 0) {
            this.enquiryNatures.set(items);
          }
        } else if (type === LookupType.EnquiryMode || type === 'EnquiryMode' || type === 7) {
          if (items && items.length > 0) {
            this.enquiryModes.set(items);
          }
        }
      }),
      catchError(() => {
        if (type === LookupType.PipelineStage || type === 'PipelineStage' || type === 5) {
          return of(this.defaultPipelineStages);
        }
        if (type === LookupType.NatureOfEnquiry || type === 'NatureOfEnquiry' || type === 6) {
          return of(this.defaultEnquiryNatures);
        }
        if (type === LookupType.EnquiryMode || type === 'EnquiryMode' || type === 7) {
          return of(this.defaultEnquiryModes);
        }
        return of([]);
      })
    );
  }

  /**
   * Lazily loads Unit of Measure lookups on demand, utilizing cached signals to eliminate redundant requests.
   * @param callback Optional callback invoked after items are loaded.
   */
  ensureUnitOfMeasuresLoaded(callback?: (items: LookupItem[]) => void): void {
    if (this.unitOfMeasures().length > 0) {
      if (callback) callback(this.unitOfMeasures());
      return;
    }

    this.getLookupsByType(LookupType.UnitOfMeasure).subscribe({
      next: items => {
        if (callback) callback(items || []);
      },
      error: () => {
        if (callback) callback([]);
      }
    });
  }

  /**
   * Lazily loads Pipeline Stage lookups on demand from the lookups API.
   * @param callback Optional callback invoked after pipeline stages are loaded.
   */
  ensurePipelineStagesLoaded(callback?: (items: LookupItem[]) => void): void {
    this.getLookupsByType(LookupType.PipelineStage).subscribe({
      next: items => {
        if (callback) callback(items && items.length > 0 ? items : this.defaultPipelineStages);
      },
      error: () => {
        if (callback) callback(this.defaultPipelineStages);
      }
    });
  }

  /**
   * Lazily loads Nature of Enquiry lookups on demand from the lookups API.
   * @param callback Optional callback invoked after enquiry natures are loaded.
   */
  ensureEnquiryNaturesLoaded(callback?: (items: LookupItem[]) => void): void {
    this.getLookupsByType(LookupType.NatureOfEnquiry).subscribe({
      next: items => {
        if (callback) callback(items && items.length > 0 ? items : this.defaultEnquiryNatures);
      },
      error: () => {
        if (callback) callback(this.defaultEnquiryNatures);
      }
    });
  }

  /**
   * Lazily loads Enquiry Mode lookups on demand from the lookups API.
   * @param callback Optional callback invoked after enquiry modes are loaded.
   */
  ensureEnquiryModesLoaded(callback?: (items: LookupItem[]) => void): void {
    this.getLookupsByType(LookupType.EnquiryMode).subscribe({
      next: items => {
        if (callback) callback(items && items.length > 0 ? items : this.defaultEnquiryModes);
      },
      error: () => {
        if (callback) callback(this.defaultEnquiryModes);
      }
    });
  }
}
