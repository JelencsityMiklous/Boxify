import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StatsService } from '../../services/api.service';
import { Item } from '../../models/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <div class="page-title">🔍 Tárgy keresés</div>
          <div class="page-sub muted">„Hol van ez a tárgy?" – gyors lokátor</div>
        </div>
      </div>

      <div class="bx-card" style="margin-bottom:24px;">
        <div class="bx-card-body">
          <div class="search-wrap">
            <span class="s-icon">🔍</span>
            <input
              type="text"
              class="big-search"
              placeholder="Tárgy neve, leírás, kategória…"
              [(ngModel)]="query"
              (input)="onSearch()"
              autofocus
            />
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="empty-state">⏳ Keresés…</div>

      <div *ngIf="!loading && searched && !results.length" class="empty-state">
        <div style="font-size:40px;margin-bottom:12px;">🔍</div>
        <div>Nincs találat: „{{ query }}"</div>
      </div>

      <div class="results">
        <div class="result-card" *ngFor="let item of results">
          <div class="result-icon">{{ getCatEmoji(item.category) }}</div>
          <div class="result-info">
            <div class="result-name">{{ item.name }}</div>
            <div class="result-meta muted">
              {{ item.category || 'Egyéb' }} &nbsp;·&nbsp;
              <span class="mono">{{ item.lengthCm }}×{{ item.widthCm }}×{{ item.heightCm }} cm · {{ item.weightKg }} kg</span>
            </div>
            <div *ngIf="item.box" class="box-locator">
              <span class="box-code-badge">{{ item.box.code }}</span>
              <span style="font-size:13px;">{{ item.box.name }}</span>
              <span class="muted" style="font-size:12px;">📍 {{ item.box.location }}</span>
            </div>
            <div *ngIf="!item.box" class="no-box">
              ⚠️ Nincs dobozban pakolva
            </div>
          </div>
          <div *ngIf="item.box">
            <a [routerLink]="['/boxes']" class="to-box-btn">→ Dobozhoz</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 20px; font-weight: 700; }

    .search-wrap { position: relative; }
    .s-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; }
    .big-search { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 14px 14px 44px; color: var(--text); font-family: var(--font-sans); font-size: 15px; outline: none; transition: border-color 0.15s;
      &:focus { border-color: var(--accent); }
      &::placeholder { color: var(--text-dim); }
    }

    .results { display: flex; flex-direction: column; gap: 12px; }

    .result-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; animation: fadeIn 0.2s ease; }

    .result-icon { font-size: 28px; }
    .result-info { flex: 1; }
    .result-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .result-meta { font-size: 12px; margin-bottom: 8px; }

    .box-locator { display: inline-flex; align-items: center; gap: 8px; background: rgba(232,255,71,0.06); border: 1px solid rgba(232,255,71,0.15); border-radius: 6px; padding: 5px 12px; }

    .no-box { font-size: 12px; color: var(--text-muted); }

    .to-box-btn { display: inline-block; font-size: 13px; color: var(--accent); border: 1px solid rgba(232,255,71,0.3); border-radius: 8px; padding: 6px 14px; text-decoration: none; white-space: nowrap;
      &:hover { background: rgba(232,255,71,0.05); }
    }

    .empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; }
  `],
})
export class SearchComponent implements OnInit {
  query = '';
  results: Item[] = [];
  loading = false;
  searched = false;
  private timer: any;

  constructor(private statsSvc: StatsService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) { this.query = params['q']; this.doSearch(); }
    });
  }

  onSearch() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.doSearch(), 350);
  }

  doSearch() {
    if (!this.query || this.query.length < 2) { this.results = []; this.searched = false; return; }
    this.loading = true;
    this.statsSvc.searchItems(this.query).subscribe({
      next: (r) => { this.results = r; this.loading = false; this.searched = true; },
      error: () => this.loading = false,
    });
  }

  getCatEmoji(cat?: string) {
    const map: Record<string, string> = { 'Elektronika': '💻', 'Ruházat': '👕', 'Könyvek': '📚', 'Sportszer': '⚽', 'Konyhai eszköz': '🍳', 'Szerszám': '🔨' };
    return map[cat || ''] || '📦';
  }
}
