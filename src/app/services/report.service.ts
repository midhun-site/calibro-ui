import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private baseUrl = 'api/reports';

  /**
   * Retrieves the raw PDF Blob stream for a calibration certificate.
   */
  getCertificatePdfBlob(certificateId: string): Observable<Blob> {
    return this.http.get(`/${this.baseUrl}/calibration-certificates/${certificateId}/pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Opens the generated QuestPDF Calibration Certificate in a new browser tab.
   */
  previewCertificatePdf(certificateId: string = 'SAMPLE-1001'): void {
    this.getCertificatePdfBlob(certificateId).subscribe({
      next: (blob: Blob) => {
        const fileUrl = URL.createObjectURL(blob);
        window.open(fileUrl, '_blank');
      },
      error: (err) => {
        console.error('Error fetching calibration certificate PDF:', err);
      }
    });
  }
}
