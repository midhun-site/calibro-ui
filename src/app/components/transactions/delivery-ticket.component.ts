import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-delivery-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './delivery-ticket.component.html',
  styleUrl: './delivery-ticket.component.css'
})
export class DeliveryTicketComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newDt = { woRef: '', customer: '', certNo: '', courier: '' };

  saveDt() {
    if (!this.newDt.customer || !this.newDt.woRef) {
      this.toastService.showWarning('Required Field', 'Please enter Work Order Ref and Customer Name.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('Delivery Ticket Created', `Dispatch ticket generated for ${this.newDt.customer}.`);
    this.newDt = { woRef: '', customer: '', certNo: '', courier: '' };
  }
}
