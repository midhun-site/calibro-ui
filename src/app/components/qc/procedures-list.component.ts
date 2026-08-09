import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-procedures-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './procedures-list.component.html',
  styleUrl: './procedures-list.component.css'
})
export class ProceduresListComponent {
  private toastService = inject(ToastService);
  public showCreateModal = false;

  public newProc = { docNo: '', title: '', discipline: '', standardRef: '' };

  saveProc() {
    if (!this.newProc.title || !this.newProc.docNo) {
      this.toastService.showWarning('Required Field', 'Please enter SOP Number and Title.');
      return;
    }
    this.showCreateModal = false;
    this.toastService.showSuccess('Procedure Saved', `SOP ${this.newProc.docNo} registered.`);
    this.newProc = { docNo: '', title: '', discipline: '', standardRef: '' };
  }
}
