import { Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="search-box">
        <i class="pi pi-search search-icon"></i>
        <input type="text" placeholder="Search equipment, certificates, customers..." class="search-input" />
      </div>

      <div class="topbar-actions">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span>ISO 17025 Compliant Lab</span>
        </div>
        <button class="action-icon-btn">
          <i class="pi pi-bell"></i>
          <span class="badge-dot"></span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 70px;
      margin-left: 260px;
      padding: 0 2rem;
      background: rgba(13, 19, 34, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
    }
    .search-box {
      position: relative;
      width: 380px;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    .search-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 0.6rem 1rem 0.6rem 2.5rem;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent-cyan);
    }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .action-icon-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
    }
    .badge-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-cyan);
    }
  `]
})
export class TopbarComponent {}
