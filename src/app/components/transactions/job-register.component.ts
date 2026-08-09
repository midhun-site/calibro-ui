import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-job-register',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './job-register.component.html',
  styleUrl: './job-register.component.css'
})
export class JobRegisterComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newJob = { woRef: '', assetTag: '', instrument: '', tech: '' };

  saveJob() {
    if (!this.newJob.woRef || !this.newJob.assetTag) {
      this.toastService.showWarning('Required Field', 'Please enter Work Order Ref and Asset Tag.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('Job Registered', `Job record logged for ${this.newJob.assetTag}.`);
    this.newJob = { woRef: '', assetTag: '', instrument: '', tech: '' };
  }
}
