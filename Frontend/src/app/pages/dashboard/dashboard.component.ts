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
    <div class="page-wrapper">
      <!-- STATS -->
      <div class="stats-grid">
        <div class="stat-card" style="--ac: var(--accent)">
          <div class="stat-label">Összes doboz</div>
          <div class="stat-value">{{ stats?.totalBoxes ?? '–' }}</div>
          <div class="stat-sub">{{ stats?.emptyBoxes }} üres · {{ stats?.activeBoxes }} aktív</div>
        </div>
        <div class="stat-card" style="--ac: var(--accent3)">
          <div class="stat-label">Összes tárgy</div>
          <div class="stat-value">{{ stats?.totalItems ?? '–' }}</div>
          <div class="stat-sub">{{ stats?.categories?.length ?? 0 }} kategóriában</div>
        </div>
        <div class="stat-card" style="--ac: var(--accent2)">
          <div class="stat-label">Foglalt súly</div>
          <div class="stat-value">{{ stats?.totalUsedWeight ?? '–' }}<span class="stat-unit">kg</span></div>
          <div class="stat-sub">{{ stats?.totalMaxWeight }} kg kapacitásból</div>
        </div>
        <div class="stat-card" style="--ac: #b47dff">
          <div class="stat-icon">📊</div>
          <div class="stat-label">Átl. telítettség</div>
          <div class="stat-value">{{ stats?.avgVolumeFill ?? '–' }}<span class="stat-unit">%</span></div>
          <div class="stat-sub">térfogat alapján</div>
        </div>
      </div>

      <div class="content-grid">
        <!-- TOP BOXES -->
        <div class="bx-card">
          <div class="bx-card-header">
            <span> Legtelítettebb dobozok</span>
            <a routerLink="/boxes" class="link-sm">Összes →</a>
          </div>
          <div class="bx-card-body">
            <div *ngIf="loading" class="empty-state">Betöltés…</div>
            <div *ngIf="!loading && !stats?.topBoxes?.length" class="empty-state">Még nincsenek dobozok</div>
            <div *ngFor="let entry of stats?.topBoxes" class="fill-item">
              <div class="fill-meta">
                <div>
                  <div class="fill-name">{{ entry.box.name }}</div>
                  <div class="fill-code mono">{{ entry.box.code }}</div>
                </div>
                <div class="fill-pct" [class]="fillClass(entry.fill.volumeFillPercent)">
                  {{ entry.fill.volumeFillPercent }}%
                </div>
              </div>
              <p-progressBar
                [value]="entry.fill.volumeFillPercent"
                [showValue]="false"
                [style]="{ height: '6px', background: 'var(--surface2)' }"
                [styleClass]="'fill-pb-' + fillClass(entry.fill.volumeFillPercent)"
              ></p-progressBar>
            </div>
          </div>
        </div>

        <!-- CATEGORIES -->
        <div class="bx-card">
          <div class="bx-card-header">
            <span> Kategóriák</span>
          </div>
          <div class="bx-card-body">
            <div *ngIf="!stats?.categories?.length" class="empty-state">Még nincsenek tárgyak</div>
            <div *ngFor="let cat of stats?.categories; let i = index" class="cat-item">
              <div class="cat-dot" [style.background]="catColors[i % catColors.length]"></div>
              <div class="cat-name muted">{{ cat.name }}</div>
              <div class="cat-count mono">{{ cat.count }} db</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden;
      &::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--ac, var(--accent)); }
    }
    .stat-icon { position: absolute; right: 16px; top: 16px; font-size: 24px; opacity: 0.15; }
    .stat-label { font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .stat-value { font-size: 32px; font-family: var(--font-mono); font-weight: 700; line-height: 1; margin-bottom: 6px; }
    .stat-unit { font-size: 16px; color: var(--text-muted); }
    .stat-sub { font-size: 12px; color: var(--text-muted); }

    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .fill-item { margin-bottom: 16px; &:last-child { margin-bottom: 0; } }
    .fill-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .fill-name { font-size: 13px; font-weight: 500; }
    .fill-code { font-size: 11px; color: var(--text-muted); }
    .fill-pct { font-family: var(--font-mono); font-size: 12px; }
    .c-red { color: #ff6b6b; } .c-orange { color: var(--accent2); } .c-yellow { color: var(--accent); } .c-green { color: var(--accent3); }

    .link-sm { font-size: 12px; color: var(--accent); text-decoration: none; &:hover { text-decoration: underline; } }

    .empty-state { text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px; }

    .cat-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; &:last-child { margin-bottom: 0; } }
    .cat-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    .cat-name { flex: 1; font-size: 13px; }
    .cat-count { font-size: 12px; }
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
