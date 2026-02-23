import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [ButtonModule],
  template: ``,
  styles: [
    ``,
  ],
})
export class TopbarComponent {
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
