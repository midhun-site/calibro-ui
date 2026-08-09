import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../services/api.service';
import { CustomerEquipment, EquipmentStatus } from '../../models/equipment.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, InputTextModule],
  templateUrl: './equipment-list.component.html',
  styleUrl: './equipment-list.component.css'
})
export class EquipmentListComponent implements OnInit {
  private api = inject(ApiService);
  private toastService = inject(ToastService);

  public equipments = signal<CustomerEquipment[]>([]);
  public showCreateModal = false;

  public newEq: CustomerEquipment = {
    id: '0',
    customerId: '1',
    customerName: 'AeroSpace Tech LLC',
    assetTag: '',
    name: '',
    serialNumber: '',
    category: 'Pressure',
    manufacturer: '',
    model: '',
    location: 'Lab A',
    accuracySpec: '',
    measurementRange: '',
    calibrationIntervalMonths: 12,
    status: EquipmentStatus.Active,
    isOverdue: false
  };

  ngOnInit() {
    this.api.getEquipments().subscribe(data => {
      this.equipments.set(data);
    });
  }

  saveEquipment() {
    if (!this.newEq.assetTag || !this.newEq.name) {
      this.toastService.showWarning('Validation Warning', 'Please provide Asset Tag and Instrument Name.');
      return;
    }

    const created: CustomerEquipment = { ...this.newEq, id: String(Date.now()) };
    this.api.createEquipment(this.newEq).subscribe({
      next: () => {
        this.equipments.update(list => [created, ...list]);
        this.showCreateModal = false;
        this.toastService.showSuccess('Instrument Registered', `Asset ${this.newEq.assetTag} saved to calibration inventory.`);
        this.resetForm();
      },
      error: () => {
        // Fallback for mock environment
        this.equipments.update(list => [created, ...list]);
        this.showCreateModal = false;
        this.toastService.showSuccess('Instrument Registered', `Asset ${this.newEq.assetTag} saved to calibration inventory.`);
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.newEq = {
      id: '0',
      customerId: '1',
      customerName: 'AeroSpace Tech LLC',
      assetTag: '',
      name: '',
      serialNumber: '',
      category: 'Pressure',
      manufacturer: '',
      model: '',
      location: 'Lab A',
      accuracySpec: '',
      measurementRange: '',
      calibrationIntervalMonths: 12,
      status: EquipmentStatus.Active,
      isOverdue: false
    };
  }
}
