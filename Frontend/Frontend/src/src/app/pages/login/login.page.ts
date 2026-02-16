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
  template: `
    <div class="auth-wrap">
      <p-card header="Bejelentkezés" styleClass="auth-card">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Email</label>
          <input pInputText formControlName="email" class="full" placeholder="email@pelda.hu" />

          <label>Jelszó</label>
          <p-password formControlName="password" [feedback]="false" [toggleMask]="true" styleClass="full"></p-password>

          <button pButton type="submit" class="full mt" label="Belépés" [disabled]="form.invalid || loading"></button>
        </form>

        <div class="links">
          <a routerLink="/register">Regisztráció</a>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
    .auth-wrap{min-height:100vh;display:flex;justify-content:center;align-items:center;padding:18px;}
    .auth-card{width:420px;}
    .full{width:100%;}
    label{display:block;margin-top:12px;margin-bottom:6px;color:#374151;}
    .mt{margin-top:16px;}
    .links{margin-top:12px;font-size:13px;color:#2563eb;}
  `,
  ],
})
export class LoginPage {
  loading = false;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private ms: MessageService) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        this.loading = false;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Login failed' });
      },
    });
  }
}
