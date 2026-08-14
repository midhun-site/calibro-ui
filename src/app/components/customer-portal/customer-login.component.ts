import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.css'
})
export class CustomerLoginComponent {
  private router = inject(Router);
  private toastService = inject(ToastService);
  public themeService = inject(ThemeService);

  public email = signal<string>('client@apexenergy.ae');
  public password = signal<string>('Customer@123');
  public rememberMe = signal<boolean>(true);
  public isLoading = signal<boolean>(false);

  public portalFeatures = [
    { icon: 'pi-truck', title: 'Track Job Progress', desc: 'Real-time calibration status tracking from intake to dispatch.' },
    { icon: 'pi-history', title: 'View Instrument History', desc: 'Complete historical logs and historical calibration data.' },
    { icon: 'pi-file-pdf', title: 'Download Certificates', desc: 'Instant access to ISO 17025 accredited calibration certificates.' },
    { icon: 'pi-file-excel', title: 'Download Invoices', desc: 'Access tax invoices, billing statements, and payment receipts.' },
    { icon: 'pi-calendar-times', title: 'Recalibration Due Dates', desc: 'Automated 30-day and 60-day recalibration alert tracking.' },
    { icon: 'pi-send', title: 'Submit Online Requests', desc: 'Direct online intake submission for new calibration jobs.' },
    { icon: 'pi-dollar', title: 'Request Quotations', desc: 'Fast online quotation requests with automated estimate previews.' }
  ];

  login() {
    if (!this.email() || !this.password()) {
      this.toastService.showError('Validation Error', 'Please enter your customer email and password.');
      return;
    }

    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.toastService.showSuccess('Customer Login Successful', 'Welcome to CaliBro Customer Portal.');
      this.router.navigate(['/customer/dashboard']);
    }, 900);
  }

  quickDemoLogin(demoEmail: string) {
    this.email.set(demoEmail);
    this.password.set('Customer@123');
    this.login();
  }
}
