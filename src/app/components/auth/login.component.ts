import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public toastService = inject(ToastService);
  private router = inject(Router);

  public username = 'admin';
  public password = 'password123';
  public errorMessage = '';

  onLogin() {
    if (this.authService.login(this.username, this.password)) {
      this.toastService.showSuccess('Welcome to CaliBro', 'Logged in as Senior Metrologist Alex Rivera.');
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password. Please try again.';
      this.toastService.showError('Login Failed', 'Invalid username or password credentials.');
    }
  }
}
