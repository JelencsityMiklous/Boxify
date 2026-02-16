import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <app-sidebar></app-sidebar>
      <div class="main">
        <app-topbar></app-topbar>
        <div class="page">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .shell { display: flex; min-height: 100vh; }
    .main { flex: 1; display: flex; flex-direction: column; }
    .page { padding: 18px; }
  `,
  ],
})
export class LayoutComponent {}
