import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomerListComponent } from './components/customers/customer-list.component';
import { EquipmentListComponent } from './components/equipment/equipment-list.component';
import { CertificateViewerComponent } from './components/certificates/certificate-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomerListComponent },
  { path: 'equipment', component: EquipmentListComponent },
  { path: 'certificates', component: CertificateViewerComponent },
  { path: '**', redirectTo: 'dashboard' }
];
