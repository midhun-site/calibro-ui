import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-delivery-in',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './delivery-in.component.html',
  styleUrl: './delivery-in.component.css'
})
export class DeliveryInComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newDin = { quoteRef: '', customer: '', count: 1, condition: 'Good Condition' };

  saveDin() {
    if (!this.newDin.customer || !this.newDin.quoteRef) {
      this.toastService.showWarning('Required Field', 'Please enter Quote Ref and Customer Name.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('Equipment Received', `Delivery In logged for ${this.newDin.customer}.`);
    this.newDin = { quoteRef: '', customer: '', count: 1, condition: 'Good Condition' };
  }
}
