import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newReview = { enquiryRef: '', customer: '', scope: '', assessment: 'ISO 17025 Capable' };

  saveReview() {
    if (!this.newReview.customer || !this.newReview.enquiryRef) {
      this.toastService.showWarning('Required Field', 'Please enter Enquiry Ref and Customer Name.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('Contract Review Saved', `Technical review for ${this.newReview.enquiryRef} completed.`);
    this.newReview = { enquiryRef: '', customer: '', scope: '', assessment: 'ISO 17025 Capable' };
  }
}
