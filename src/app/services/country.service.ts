import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { CountryLookup } from '../models/customer.model';
import { environment } from '../../environments/environment';

/**
 * Dedicated service responsible for country reference data HTTP API operations
 * and reactive in-memory state caching.
 */
@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** Default fallback countries if server is cold/offline */
  private readonly defaultCountries: CountryLookup[] = [
    { id: 1, code: 'AE', name: 'United Arab Emirates', phoneCode: '+971', isActive: true },
    { id: 2, code: 'SA', name: 'Saudi Arabia', phoneCode: '+966', isActive: true },
    { id: 3, code: 'QA', name: 'Qatar', phoneCode: '+974', isActive: true },
    { id: 4, code: 'OM', name: 'Oman', phoneCode: '+968', isActive: true },
    { id: 5, code: 'KW', name: 'Kuwait', phoneCode: '+965', isActive: true },
    { id: 6, code: 'BH', name: 'Bahrain', phoneCode: '+973', isActive: true },
    { id: 7, code: 'US', name: 'United States', phoneCode: '+1', isActive: true },
    { id: 8, code: 'GB', name: 'United Kingdom', phoneCode: '+44', isActive: true },
    { id: 9, code: 'DE', name: 'Germany', phoneCode: '+49', isActive: true },
    { id: 10, code: 'IN', name: 'India', phoneCode: '+91', isActive: true },
    { id: 11, code: 'SG', name: 'Singapore', phoneCode: '+65', isActive: true }
  ];

  /** Reactive signal containing country records for dropdown selection. */
  public countries = signal<CountryLookup[]>([]);

  /**
   * Retrieves active country records from the backend API.
   * @returns Observable resolving with the country list.
   */
  getCountries(): Observable<CountryLookup[]> {
    return this.http.get<CountryLookup[]>(`${this.baseUrl}/countries`).pipe(
      catchError(() => of(this.defaultCountries)),
      tap(list => {
        if (list && list.length > 0) {
          this.countries.set(list);
        }
      })
    );
  }
}
