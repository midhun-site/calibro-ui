import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LookupItem, LookupType } from '../models/lookup.model';

/**
 * Service managing generic configurable lookup reference datasets from the backend REST API.
 */
@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7124/api/v1.0';

  /** Reactive cached signals for common lookup categories */
  public unitOfMeasures = signal<LookupItem[]>([]);
  public equipmentCategories = signal<LookupItem[]>([]);
  public priorityLevels = signal<LookupItem[]>([]);

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
        }
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
}
