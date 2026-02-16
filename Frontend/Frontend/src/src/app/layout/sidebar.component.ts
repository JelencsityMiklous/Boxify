import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">📦</div>
        <div>
          <div class="title">Boxify</div>
          <div class="subtitle">storage manager</div>
        </div>
      </div>

      <nav class="nav">
        <a routerLink="/dashboard" routerLinkActive="active"> <i class="pi pi-chart-bar"></i> Dashboard</a>
        <a routerLink="/boxes" routerLinkActive="active"> <i class="pi pi-inbox"></i> Boxes</a>
        <a routerLink="/items" routerLinkActive="active"> <i class="pi pi-box"></i> Items</a>
        <a routerLink="/packing" routerLinkActive="active"> <i class="pi pi-plus-circle"></i> Packing</a>
        <a routerLink="/search" routerLinkActive="active"> <i class="pi pi-search"></i> Search</a>
      </nav>

      <div class="hint">Tipp: Boxes → Contents nézetben látszik a telítettség.</div>
    </aside>
  `,
  styles: [
    `
    .sidebar{width:240px;background:var(--panel);border-right:1px solid var(--border);padding:14px;position:sticky;top:0;height:100vh;}
    .brand{display:flex;gap:10px;align-items:center;margin-bottom:16px;}
    .logo{font-size:22px;}
    .title{font-weight:800;font-size:18px;line-height:1;}
    .subtitle{font-size:12px;color:#6b7280;}
    .nav{display:flex;flex-direction:column;gap:6px;}
    .nav a{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:10px;text-decoration:none;color:var(--text);}
    .nav a.active{background:#eff6ff;}
    .hint{margin-top:16px;font-size:12px;color:#6b7280;}
  `,
  ],
})
export class SidebarComponent {}
