import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tech-lab-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './tech-lab-mapping.component.html',
  styleUrl: './tech-lab-mapping.component.css'
})
export class TechLabMappingComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newMap = { techName: '', labCode: '', clearance: '' };

  saveMapping() {
    if (!this.newMap.techName || !this.newMap.labCode) {
      this.toastService.showWarning('Required Field', 'Please enter Technician Name and Lab Code.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('Lab Assignment Saved', `${this.newMap.techName} assigned to ${this.newMap.labCode}.`);
    this.newMap = { techName: '', labCode: '', clearance: '' };
  }
}
