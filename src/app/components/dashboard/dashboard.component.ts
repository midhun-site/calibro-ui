import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TagModule } from 'primeng/tag';
import { HighchartsChartComponent } from 'highcharts-angular';
import type * as Highcharts from 'highcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TagModule, HighchartsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  public stats = this.api.dashboardStats;

  // Chart 1: Monthly Calibration Work Orders & Revenue Trend
  public trendChartOptions: Highcharts.Options = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      style: { fontFamily: "'Outfit', sans-serif" }
    },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      labels: { style: { color: '#94a3b8' } },
      lineColor: 'rgba(255, 255, 255, 0.1)'
    },
    yAxis: [
      {
        title: { text: 'Work Orders', style: { color: '#00f2fe' } },
        labels: { style: { color: '#94a3b8' } },
        gridLineColor: 'rgba(255, 255, 255, 0.05)'
      },
      {
        title: { text: 'Revenue ($)', style: { color: '#4facfe' } },
        labels: { style: { color: '#94a3b8' } },
        opposite: true,
        gridLineWidth: 0
      }
    ],
    tooltip: {
      shared: true,
      backgroundColor: '#111827',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      style: { color: '#f8fafc' }
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.2
      }
    },
    series: [
      {
        name: 'Work Orders Completed',
        type: 'areaspline',
        data: [14, 18, 22, 29, 35, 42, 38, 48],
        color: '#00f2fe'
      },
      {
        name: 'Monthly Revenue ($)',
        type: 'spline',
        yAxis: 1,
        data: [1400, 1850, 2200, 3100, 3900, 4700, 4200, 5400],
        color: '#4facfe'
      }
    ]
  };

  // Chart 2: Equipment Status Breakdown (Donut)
  public statusChartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      style: { fontFamily: "'Outfit', sans-serif" }
    },
    title: { text: '' },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: '65%',
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}',
          style: { color: '#f8fafc', fontSize: '12px' }
        }
      }
    },
    tooltip: {
      backgroundColor: '#111827',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      style: { color: '#f8fafc' }
    },
    series: [
      {
        name: 'Instruments',
        type: 'pie',
        data: [
          { name: 'ISO Compliant / Active', y: 24, color: '#10b981' },
          { name: 'Overdue Calibration', y: 4, color: '#ef4444' },
          { name: 'In-Lab Service', y: 8, color: '#00f2fe' },
          { name: 'Due Next 30 Days', y: 6, color: '#f59e0b' }
        ]
      }
    ]
  };

  // Chart 3: Instrument Category Distribution (Column Bar)
  public categoryChartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      style: { fontFamily: "'Outfit', sans-serif" }
    },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: {
      categories: ['Pressure', 'Temperature', 'Electrical', 'Dimensional', 'Torque & Mass'],
      labels: { style: { color: '#94a3b8' } },
      lineColor: 'rgba(255, 255, 255, 0.1)'
    },
    yAxis: {
      title: { text: 'Equipment Count', style: { color: '#94a3b8' } },
      labels: { style: { color: '#94a3b8' } },
      gridLineColor: 'rgba(255, 255, 255, 0.05)'
    },
    tooltip: {
      backgroundColor: '#111827',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      style: { color: '#f8fafc' }
    },
    plotOptions: {
      column: {
        borderRadius: 8,
        borderWidth: 0
      }
    },
    series: [
      {
        name: 'Assets',
        type: 'column',
        data: [
          { y: 16, color: '#00f2fe' },
          { y: 12, color: '#4facfe' },
          { y: 9, color: '#10b981' },
          { y: 7, color: '#a855f7' },
          { y: 5, color: '#f59e0b' }
        ]
      }
    ]
  };

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.api.getDashboardStats().subscribe();
  }
}
