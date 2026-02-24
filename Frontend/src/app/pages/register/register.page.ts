import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterPage {
  loading = false;
  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private ms: MessageService) {}

  submit() {
    const v = this.form.getRawValue();
    if (this.form.invalid) return;
    if (v.password !== v.confirm) {
      this.ms.add({ severity: 'warn', summary: 'Figyelem', detail: 'A jelszavak nem egyeznek' });
      return;
    }

    this.loading = true;
    this.auth.register(v as any).subscribe({
      next: () => {
        this.loading = false;
        this.ms.add({ severity: 'success', summary: 'OK', detail: 'Sikeres regisztráció, lépj be!' });
        this.router.navigate(['/login']);
      },
      error: (e) => {
        this.loading = false;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Register failed' });
      },
    });
  }
}
