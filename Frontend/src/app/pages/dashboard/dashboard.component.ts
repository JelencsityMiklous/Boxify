import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';
import { StatsService } from '../../services/api.service';
import { StatsOverview } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressBarModule],
  template: `
  `,
  styles: [`
    `],
})
export class DashboardComponent implements OnInit {
  stats: StatsOverview | null = null;
  loading = true;
  catColors = ['#e8ff47', '#4dffb4', '#ff6b35', '#b47dff', '#888', '#ff6b6b'];

  constructor(private statsService: StatsService) {}

  ngOnInit() {
    this.statsService.overview().subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  fillClass(pct: number) {
    if (pct >= 90) return 'c-red';
    if (pct >= 70) return 'c-orange';
    if (pct >= 40) return 'c-yellow';
    return 'c-green';
  }
}
