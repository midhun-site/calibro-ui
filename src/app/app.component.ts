import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar.component';
import { TopbarComponent } from './components/layout/topbar.component';
import { ToastComponent } from './components/toast/toast.component';
import { ThemeService } from './services/theme.service';
import { LayoutService } from './services/layout.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'calibro-ui';
  public themeService = inject(ThemeService);
  public layoutService = inject(LayoutService);
  private router = inject(Router);

  isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }
}
