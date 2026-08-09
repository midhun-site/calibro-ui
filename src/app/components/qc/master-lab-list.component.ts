import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-master-lab-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './master-lab-list.component.html',
  styleUrl: './master-lab-list.component.css'
})
export class MasterLabListComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newLab = { code: '', name: '', discipline: '', lead: '' };

  saveLab() {
    if (!this.newLab.name || !this.newLab.code) {
      this.toastService.showWarning('Required Field', 'Please enter Lab Code and Name.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('Master Lab Saved', `Laboratory ${this.newLab.name} registered.`);
    this.newLab = { code: '', name: '', discipline: '', lead: '' };
  }
}
