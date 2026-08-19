import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Standalone login component for the CaliBro authentication screen.
 * Submits credentials to the CaliBro API via AuthService and navigates to the dashboard on success.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public toastService = inject(ToastService);
  private router = inject(Router);

  public username = signal<string>('');
  public password = signal<string>('');
  public rememberMe = signal<boolean>(false);
  public isLoading = signal<boolean>(false);

  public staffFeatures = [
    { icon: 'pi-verified', title: 'ISO 17025 Calibration Engine', desc: 'Automated certificate generation, EA-4/02 uncertainty budgets & CTR logs.' },
    { icon: 'pi-sliders-h', title: 'Equipment & Master Standards', desc: 'Master standard recalibration alerts, lab mapping, and asset history.' },
    { icon: 'pi-sitemap', title: 'End-to-End CQRS Workflows', desc: 'Seamless sequence from Customer Enquiry ➔ Review ➔ Quotation ➔ Workorder ➔ Delivery Ticket.' },
    { icon: 'pi-chart-bar', title: 'Laboratory Revenue Analytics', desc: 'Throughput metrics, lab revenue analytics, and automated reporting.' },
    { icon: 'pi-shield', title: 'Role-Based Audit & Security', desc: 'Granular permissions, metrologist sign-off seals, and full audit logs.' }
  ];

  /**
   * Handles the login form submission.
   * Validates inputs, calls the real API via AuthService, and navigates to /dashboard on success.
   */
  onLogin() {
    if (!this.username() || !this.password()) {
      this.toastService.showError('Validation Error', 'Please enter your username and password.');
      return;
    }

    this.isLoading.set(true);

    // Call the real CaliBro API login endpoint
    this.authService.login({ username: this.username(), password: this.password() }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.toastService.showError('Login Failed', err.message);
      }
    });
  }

  /**
   * Pre-fills credentials and submits login — used for demo/quick-access buttons.
   * @param user - Demo username.
   * @param pass - Demo password.
   */
  quickDemoLogin(user: string, pass: string) {
    this.username.set(user);
    this.password.set(pass);
    this.onLogin();
  }
}
