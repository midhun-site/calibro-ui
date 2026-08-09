import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './quotation.component.html',
  styleUrl: './quotation.component.css'
})
export class QuotationComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newQuote = {
    customerName: '',
    validityDays: 30,
    totalValue: 0,
    remarks: ''
  };

  saveQuotation() {
    if (!this.newQuote.customerName) {
      this.toastService.showWarning('Required Field', 'Please enter Customer Name for the quotation.');
      return;
    }

    this.showCreateModal = false;
    this.toastService.showSuccess('Quotation Created', 'Calibration proposal quotation saved successfully.');
    this.newQuote = { customerName: '', validityDays: 30, totalValue: 0, remarks: '' };
  }
}
