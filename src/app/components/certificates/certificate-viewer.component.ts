import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-certificate-viewer',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './certificate-viewer.component.html',
  styleUrl: './certificate-viewer.component.css'
})
export class CertificateViewerComponent {
  printCert() {
    window.print();
  }
}
