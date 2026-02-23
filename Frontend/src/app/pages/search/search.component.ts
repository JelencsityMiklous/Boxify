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
    
  `,
  styles: [`
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
