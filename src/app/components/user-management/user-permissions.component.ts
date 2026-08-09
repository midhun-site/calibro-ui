import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-permissions.component.html',
  styleUrl: './user-permissions.component.css'
})
export class UserPermissionsComponent {
  private toastService = inject(ToastService);

  savePermissions() {
    this.toastService.showSuccess('Permissions Saved', 'Role access security matrix updated.');
  }
}
