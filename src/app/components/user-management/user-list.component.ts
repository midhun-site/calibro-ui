import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newUser = { fullName: '', email: '', role: 'Metrologist', department: '' };

  saveUser() {
    if (!this.newUser.fullName || !this.newUser.email) {
      this.toastService.showWarning('Required Field', 'Please enter Full Name and Email Address.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('User Account Created', `User ${this.newUser.fullName} registered.`);
    this.newUser = { fullName: '', email: '', role: 'Metrologist', department: '' };
  }
}
