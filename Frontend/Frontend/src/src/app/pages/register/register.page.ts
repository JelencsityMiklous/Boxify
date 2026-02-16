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
      <p-card header="Regisztráció" styleClass="auth-card">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Név</label>
          <input pInputText formControlName="name" class="full" placeholder="Név" />

          <label>Email</label>
          <input pInputText formControlName="email" class="full" placeholder="email@pelda.hu" />

          <label>Jelszó</label>
          <p-password formControlName="password" [feedback]="true" [toggleMask]="true" styleClass="full"></p-password>

          <label>Jelszó újra</label>
          <p-password formControlName="confirm" [feedback]="false" [toggleMask]="true" styleClass="full"></p-password>

          <button pButton type="submit" class="full mt" label="Regisztráció" [disabled]="form.invalid || loading"></button>
        </form>

        <div class="links">
          <a routerLink="/login">Vissza a belépéshez</a>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
    .auth-wrap{min-height:100vh;display:flex;justify-content:center;align-items:center;padding:18px;}
    .auth-card{width:460px;}
    .full{width:100%;}
    label{display:block;margin-top:12px;margin-bottom:6px;color:#374151;}
    .mt{margin-top:16px;}
    .links{margin-top:12px;font-size:13px;color:#2563eb;}
  `,
  ],
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
