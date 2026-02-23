import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: ``,
  styles: [``],
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
