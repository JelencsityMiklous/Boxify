import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [ButtonModule],
  template: `
    <header class="topbar">
      <div class="left">
        <span class="crumb">Boxify</span>
      </div>
      <div class="right">
        <button pButton type="button" icon="pi pi-sign-out" label="Kilépés" (click)="logout()"></button>
      </div>
    </header>
  `,
  styles: [
    `
    .topbar{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid var(--border);background:var(--panel);}
    .crumb{font-weight:700;}
  `,
  ],
})
export class TopbarComponent {
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
