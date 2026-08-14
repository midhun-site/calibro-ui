import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomerListComponent } from './components/customers/customer-list.component';
import { EquipmentListComponent } from './components/equipment/equipment-list.component';
import { CertificateViewerComponent } from './components/certificates/certificate-viewer.component';
import { CertificateGenerateComponent } from './components/certificates/certificate-generate.component';
import { EnquiryComponent } from './components/transactions/enquiry.component';
import { EnquiryAddComponent } from './components/transactions/enquiry-add.component';
import { EnquiryPrintComponent } from './components/transactions/enquiry-print.component';
import { ReviewComponent } from './components/transactions/review.component';
import { QuotationComponent } from './components/transactions/quotation.component';
import { DeliveryInComponent } from './components/transactions/delivery-in.component';
import { JobRegisterComponent } from './components/transactions/job-register.component';
import { WorkorderComponent } from './components/transactions/workorder.component';
import { DeliveryTicketComponent } from './components/transactions/delivery-ticket.component';
import { CalibrationReportComponent } from './components/reports/calibration-report.component';
import { InvoiceReportComponent } from './components/reports/invoice-report.component';
import { MasterLabListComponent } from './components/qc/master-lab-list.component';
import { ProceduresListComponent } from './components/qc/procedures-list.component';
import { TechProcMappingComponent } from './components/qc/tech-proc-mapping.component';
import { TechLabMappingComponent } from './components/qc/tech-lab-mapping.component';
import { UserListComponent } from './components/user-management/user-list.component';
import { UserPermissionsComponent } from './components/user-management/user-permissions.component';
import { PrintPreviewComponent } from './components/common/print-preview.component';
import { CustomerLoginComponent } from './components/customer-portal/customer-login.component';
import { CustomerDashboardComponent } from './components/customer-portal/customer-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  // Customer Portal Routes (http://localhost:4200/customer/login & /customer/dashboard)
  { path: 'customer', redirectTo: 'customer/login', pathMatch: 'full' },
  { path: 'customer/login', component: CustomerLoginComponent },
  { path: 'customer/dashboard', component: CustomerDashboardComponent },
  
  // Generic Print Preview Route (supports /print-preview/:type/:id & /transactions/:type/print/:id)
  { path: 'print-preview/:type/:id', component: PrintPreviewComponent, canActivate: [authGuard] },
  { path: 'transactions/:type/print/:id', component: PrintPreviewComponent, canActivate: [authGuard] },
  
  // Transactions Group Sequence & Add Pages
  { path: 'transactions/enquiry', component: EnquiryComponent, canActivate: [authGuard] },
  { path: 'transactions/enquiry/add', component: EnquiryAddComponent, canActivate: [authGuard] },
  { path: 'transactions/enquiry/add/:id', component: EnquiryAddComponent, canActivate: [authGuard] },
  { path: 'transactions/enquiry/print/:id', component: PrintPreviewComponent, canActivate: [authGuard] },
  { path: 'transactions/review', component: ReviewComponent, canActivate: [authGuard] },
  { path: 'transactions/quotation', component: QuotationComponent, canActivate: [authGuard] },
  { path: 'transactions/delivery-in', component: DeliveryInComponent, canActivate: [authGuard] },
  { path: 'transactions/workorder', component: WorkorderComponent, canActivate: [authGuard] },
  { path: 'transactions/job-register', component: JobRegisterComponent, canActivate: [authGuard] },
  { path: 'transactions/certificate-generate', component: CertificateGenerateComponent, canActivate: [authGuard] },
  { path: 'transactions/delivery-ticket', component: DeliveryTicketComponent, canActivate: [authGuard] },

  // Masters Group
  { path: 'customers', component: CustomerListComponent, canActivate: [authGuard] },
  { path: 'equipment', component: EquipmentListComponent, canActivate: [authGuard] },

  // Reports & Certificate Viewer Group
  { path: 'certificates', component: CertificateViewerComponent, canActivate: [authGuard] },
  { path: 'certificates/view', component: CertificateViewerComponent },
  { path: 'certificates/view/:id', component: CertificateViewerComponent },
  { path: 'certificates/generate', component: CertificateGenerateComponent, canActivate: [authGuard] },
  { path: 'reports/calibration-report', component: CalibrationReportComponent, canActivate: [authGuard] },
  { path: 'reports/invoice-summary', component: InvoiceReportComponent, canActivate: [authGuard] },

  // QC Group
  { path: 'qc/master-lab-list', component: MasterLabListComponent, canActivate: [authGuard] },
  { path: 'qc/procedures-list', component: ProceduresListComponent, canActivate: [authGuard] },
  { path: 'qc/tech-proc-mapping', component: TechProcMappingComponent, canActivate: [authGuard] },
  { path: 'qc/tech-lab-mapping', component: TechLabMappingComponent, canActivate: [authGuard] },

  // User Management Group
  { path: 'user-management/user-list', component: UserListComponent, canActivate: [authGuard] },
  { path: 'user-management/user-permissions', component: UserPermissionsComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' }
];
