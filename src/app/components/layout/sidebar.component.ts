import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="logo-container">
        <div class="logo-badge">
          <i class="pi pi-compass text-cyan"></i>
        </div>
        <div class="logo-text">
          <h2>Cali<span class="gradient-text">Bro</span></h2>
          <span class="sub-logo">CALIBRATION CRM v1.0</span>
        </div>
      </div>

      <nav class="nav-menu">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <i class="pi pi-th-large"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/customers" routerLinkActive="active" class="nav-item">
          <i class="pi pi-building"></i>
          <span>Customers</span>
        </a>
        <a routerLink="/equipment" routerLinkActive="active" class="nav-item">
          <i class="pi pi-cog"></i>
          <span>Equipment & Assets</span>
        </a>
        <a routerLink="/certificates" routerLinkActive="active" class="nav-item">
          <i class="pi pi-verified"></i>
          <span>Certificates</span>
        </a>
      </nav>

      <div class="user-footer">
        <div class="user-avatar">
          <i class="pi pi-user text-cyan"></i>
        </div>
        <div class="user-info">
          <p class="user-name">Alex Rivera</p>
          <span class="user-role">Senior Metrologist</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: #0d1322;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 1.5rem;
    }
    .logo-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(0, 242, 254, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .logo-text h2 {
      font-size: 1.4rem;
      margin: 0;
    }
    .sub-logo {
      font-size: 0.65rem;
      color: var(--text-muted);
      letter-spacing: 1.5px;
      font-weight: 700;
    }
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.85rem 1rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 10px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-item i {
      font-size: 1.2rem;
    }
    .nav-item:hover, .nav-item.active {
      background: rgba(0, 242, 254, 0.1);
      color: var(--accent-cyan);
    }
    .user-footer {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
    }
    .user-role {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  `]
})
export class SidebarComponent {}
