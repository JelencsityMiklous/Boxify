import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/users`;

  users: User[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;
    this.http.get<User[]>(this.api).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Nem sikerült betölteni a felhasználókat';
        this.loading = false;
      }
    });
  }

  setRole(id: string, newRole: 'admin' | 'user') {
    if (!confirm(`Biztosan ${newRole === 'admin' ? 'adminná teszed' : 'lefokozod user-re'}?`)) return;

    this.http.put<User>(`${this.api}/${id}/role`, { role: newRole }).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex(u => u.id === id);
        if (idx !== -1) this.users[idx] = updated;
      },
      error: (err) => alert(err.error?.message || 'Szerepkör módosítás sikertelen')
    });
  }

  deleteUser(id: string) {
    if (!confirm('Biztosan törlöd ezt a felhasználót?')) return;

    this.http.delete(`${this.api}/${id}`).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
      },
      error: (err) => alert(err.error?.message || 'Törlés sikertelen')
    });
  }
}