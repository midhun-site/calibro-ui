import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tech-proc-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './tech-proc-mapping.component.html',
  styleUrl: './tech-proc-mapping.component.css'
})
export class TechProcMappingComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newMap = { techName: '', sopCode: '', authDate: '', status: 'QUALIFIED' };

  saveMapping() {
    if (!this.newMap.techName || !this.newMap.sopCode) {
      this.toastService.showWarning('Required Field', 'Please enter Technician Name and SOP Code.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('Mapping Created', `${this.newMap.techName} authorized for ${this.newMap.sopCode}.`);
    this.newMap = { techName: '', sopCode: '', authDate: '', status: 'QUALIFIED' };
  }
}
