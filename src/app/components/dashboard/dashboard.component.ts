import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TagModule],
  template: `
    <div class="dashboard-container">
      <div class="header-banner">
        <div>
          <h1>Welcome to <span class="gradient-text">CaliBro CRM</span></h1>
          <p class="subtitle">Calibration Laboratory Operations & Equipment Compliance Overview</p>
        </div>
        <button class="btn-primary" (click)="refreshData()">
          <i class="pi pi-refresh"></i> Refresh Stats
        </button>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="kpi-grid">
        <div class="glass-card kpi-card">
          <div class="kpi-icon-wrap cyan">
            <i class="pi pi-building"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Active Customers</span>
            <h2 class="kpi-value">{{ stats()?.totalCustomers ?? 2 }}</h2>
            <span class="kpi-sub green"><i class="pi pi-arrow-up"></i> +12% this month</span>
          </div>
        </div>

        <div class="glass-card kpi-card">
          <div class="kpi-icon-wrap blue">
            <i class="pi pi-cog"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Tracked Equipments</span>
            <h2 class="kpi-value">{{ stats()?.totalEquipments ?? 3 }}</h2>
            <span class="kpi-sub">ISO 17025 Registered</span>
          </div>
        </div>

        <div class="glass-card kpi-card">
          <div class="kpi-icon-wrap danger">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Overdue Calibrations</span>
            <h2 class="kpi-value text-danger">{{ stats()?.overdueCalibrations ?? 1 }}</h2>
            <span class="kpi-sub red"><i class="pi pi-bell"></i> Immediate action required</span>
          </div>
        </div>

        <div class="glass-card kpi-card">
          <div class="kpi-icon-wrap purple">
            <i class="pi pi-dollar"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Monthly Revenue</span>
            <h2 class="kpi-value text-cyan">\${{ stats()?.totalRevenueThisMonth ?? 472.50 | number:'1.2-2' }}</h2>
            <span class="kpi-sub green"><i class="pi pi-check-circle"></i> Invoices paid</span>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-sections">
        <!-- Calibration Work Orders in Progress -->
        <div class="glass-card section-card">
          <div class="section-header">
            <h3><i class="pi pi-spin pi-cog text-cyan"></i> Active Work Orders</h3>
            <span class="view-all">View All</span>
          </div>

          <div class="wo-list">
            <div class="wo-item">
              <div class="wo-info">
                <span class="wo-number">WO-2026-001</span>
                <span class="wo-customer">AeroSpace Tech LLC</span>
              </div>
              <div class="wo-meta">
                <span class="wo-tech"><i class="pi pi-user"></i> Alex Rivera</span>
                <p-tag value="In-Progress" severity="info"></p-tag>
              </div>
            </div>

            <div class="wo-item">
              <div class="wo-info">
                <span class="wo-number">WO-2026-002</span>
                <span class="wo-customer">BioPharm Solutions</span>
              </div>
              <div class="wo-meta">
                <span class="wo-tech"><i class="pi pi-user"></i> Marcus Vance</span>
                <p-tag value="Scheduled" severity="warning"></p-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Certificates Issued -->
        <div class="glass-card section-card">
          <div class="section-header">
            <h3><i class="pi pi-verified text-cyan"></i> Recent Certificates</h3>
            <span class="view-all">View All</span>
          </div>

          <div class="cert-list">
            <div class="cert-item">
              <div class="cert-badge">
                <i class="pi pi-file-pdf text-danger"></i>
              </div>
              <div class="cert-info">
                <span class="cert-no">CERT-2026-8891</span>
                <span class="cert-eq">Digital Pressure Gauge (0-1000 PSI)</span>
              </div>
              <div class="cert-status">
                <p-tag value="PASSED" severity="success"></p-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .subtitle {
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .btn-primary {
      background: var(--accent-gradient);
      border: none;
      color: #000;
      font-weight: 700;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .kpi-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
    }
    .kpi-icon-wrap.cyan { background: rgba(0, 242, 254, 0.1); color: var(--accent-cyan); }
    .kpi-icon-wrap.blue { background: rgba(79, 172, 254, 0.1); color: #4facfe; }
    .kpi-icon-wrap.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .kpi-icon-wrap.purple { background: rgba(127, 0, 255, 0.1); color: #e100ff; }
    .kpi-label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .kpi-value {
      font-size: 1.8rem;
      margin: 0.2rem 0;
    }
    .kpi-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .kpi-sub.green { color: #10b981; }
    .kpi-sub.red { color: #ef4444; }
    .text-danger { color: #ef4444; }

    .dashboard-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .view-all {
      font-size: 0.85rem;
      color: var(--accent-cyan);
      cursor: pointer;
    }
    .wo-list, .cert-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .wo-item, .cert-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      border-radius: 12px;
    }
    .wo-number, .cert-no {
      font-weight: 700;
      display: block;
    }
    .wo-customer, .cert-eq {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .wo-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.85rem;
    }
    .cert-badge {
      font-size: 1.8rem;
      margin-right: 0.85rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  public stats = this.api.dashboardStats;

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.api.getDashboardStats().subscribe();
  }
}
