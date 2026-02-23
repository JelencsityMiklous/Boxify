import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <div class="app-shell">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-icon">📦</div>
          <span class="logo-text">Box<span>ify</span></span>
        </div>

        <div class="nav-section-label">Navigáció</div>

        <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
           Dashboard
        </a>
        <a class="nav-item" routerLink="/boxes" routerLinkActive="active">
           Dobozok
        </a>
        <a class="nav-item" routerLink="/items" routerLinkActive="active">
           Tárgyak
        </a>
        <a class="nav-item" routerLink="/packing" routerLinkActive="active">
           Pakolás
        </a>
        <a class="nav-item" routerLink="/search" routerLinkActive="active">
          <span class="icon">🔍</span> Keresés
        </a>

        <div class="sidebar-bottom">
          <div class="user-card">
            <div class="user-avatar">{{ initials() }}</div>
            <div>
              <div class="user-name">{{ user()?.name }}</div>
              <div class="user-role">{{ user()?.role }}</div>
            </div>
            <button class="logout-btn" (click)="logout()" title="Kilépés">⏻</button>
          </div>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="main-content">
        <!-- TOPBAR -->
        <div class="topbar">
          <div class="topbar-search">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Gyors keresés…"
              [(ngModel)]="searchQuery"
              (keyup.enter)="doSearch()"
            />
          </div>
        </div>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; min-height: 100vh; overflow: hidden; }

    .sidebar {
      width: 240px; min-height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      padding: 24px 0;
      flex-shrink: 0;
      position: fixed; left: 0; top: 0; bottom: 0;
      z-index: 50;
    }

    .logo { padding: 0 24px 32px; display: flex; align-items: center; gap: 12px; }
    .logo-icon { width: 38px; height: 38px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .logo-text { font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
    .logo-text span { color: var(--accent); }

    .nav-section-label { font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--text-dim); letter-spacing: 2px; text-transform: uppercase; padding: 0 24px 10px; }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 24px; cursor: pointer;
      border-left: 3px solid transparent;
      transition: all 0.15s; color: var(--text-muted);
      font-size: 14px; font-weight: 500;
      text-decoration: none;
      &:hover { color: var(--text); background: rgba(255,255,255,0.03); }
      &.active { color: var(--accent); background: rgba(232,255,71,0.06); border-left-color: var(--accent); }
      .icon { font-size: 16px; width: 20px; text-align: center; }
    }

    .sidebar-bottom { margin-top: auto; padding: 16px 24px 0; border-top: 1px solid var(--border); }

    .user-card { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--radius); background: var(--surface2); }
    .user-avatar { width: 32px; height: 32px; border-radius: 8px; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #000; }
    .user-name { font-size: 13px; font-weight: 500; }
    .user-role { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
    .logout-btn { margin-left: auto; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px; &:hover { color: var(--text); } }

    .main-content { flex: 1; margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; overflow-y: auto; }

    .topbar { display: flex; align-items: center; padding: 14px 32px; border-bottom: 1px solid var(--border); background: var(--bg); position: sticky; top: 0; z-index: 10; }

    .topbar-search { position: relative; flex: 1; max-width: 360px; margin-left: auto; }
    .topbar-search input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px 8px 36px; color: var(--text); font-family: var(--font-sans); font-size: 13px; outline: none; transition: border-color 0.15s; &:focus { border-color: var(--accent); } &::placeholder { color: var(--text-dim); } }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; }
  `],
})
export class LayoutComponent {
  searchQuery = '';
  user = this.auth.currentUser;
  initials = computed(() => {
    const name = this.user()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  });

  constructor(private auth: AuthService, private router: Router) {}

  logout() { this.auth.logout(); }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.searchQuery = '';
    }
  }
}
