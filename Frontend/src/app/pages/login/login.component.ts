import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';

type Mode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-logo">
          <div class="login-logo-icon">📦</div>
          <h1>Box<span>ify</span></h1>
          <p>Raktározás okosan</p>
        </div>

        <!-- LOGIN -->
        <form *ngIf="mode === 'login'" [formGroup]="loginForm" (ngSubmit)="doLogin()">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input pInputText type="email" formControlName="email" placeholder="te@email.hu" class="form-input w-full"/>
          </div>
          <div class="form-group">
            <label class="form-label">Jelszó</label>
            <input pInputText type="password" formControlName="password" placeholder="••••••••" class="form-input w-full"/>
          </div>
          <div class="forgot-link">
            <a (click)="mode='forgot'">Elfelejtettem a jelszavam</a>
          </div>
          <button pButton type="submit" label="Bejelentkezés →" [loading]="loading" class="w-full mt-2"></button>
          <div class="switch-link">
            Nincs még fiókod? <a (click)="mode='register'">Regisztrálj!</a>
          </div>
        </form>

        <!-- REGISTER -->
        <form *ngIf="mode === 'register'" [formGroup]="registerForm" (ngSubmit)="doRegister()">
          <div class="form-group">
            <label class="form-label">Teljes név</label>
            <input pInputText type="text" formControlName="name" placeholder="Kovács Péter" class="form-input w-full"/>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input pInputText type="email" formControlName="email" placeholder="te@email.hu" class="form-input w-full"/>
          </div>
          <div class="form-group">
            <label class="form-label">Jelszó (min. 8 karakter)</label>
            <input pInputText type="password" formControlName="password" placeholder="••••••••" class="form-input w-full"/>
          </div>
          <button pButton type="submit" label="Regisztráció →" [loading]="loading" class="w-full mt-2"></button>
          <div class="switch-link">
            Már van fiókod? <a (click)="mode='login'">Lépj be!</a>
          </div>
        </form>

        <!-- FORGOT -->
        <form *ngIf="mode === 'forgot'" [formGroup]="forgotForm" (ngSubmit)="doForgot()">
          <p class="forgot-desc">Add meg az email-ed és küldünk egy visszaállítási linket.</p>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input pInputText type="email" formControlName="email" placeholder="te@email.hu" class="form-input w-full"/>
          </div>
          <button pButton type="submit" label="Link küldése →" [loading]="loading" class="w-full mt-2"></button>
          <div class="switch-link">
            <a (click)="mode='login'">← Vissza a belépéshez</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap { position: fixed; inset: 0; background: var(--bg); display: flex; align-items: center; justify-content: center; }
    .login-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; width: 100%; max-width: 400px; }
    .login-logo { text-align: center; margin-bottom: 32px; }
    .login-logo-icon { width: 56px; height: 56px; background: var(--accent); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 14px; }
    .login-logo h1 { font-family: var(--font-mono); font-size: 26px; font-weight: 700; }
    .login-logo h1 span { color: var(--accent); }
    .login-logo p { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .form-input { background: var(--surface2) !important; }
    .forgot-link { text-align: right; margin-bottom: 16px; a { font-size: 12px; color: var(--accent); cursor: pointer; } }
    .switch-link { text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-muted); a { color: var(--accent); cursor: pointer; } }
    .forgot-desc { color: var(--text-muted); font-size: 13px; margin-bottom: 20px; }
    .w-full { width: 100%; }
    .mt-2 { margin-top: 8px; }
  `],
})
export class LoginComponent {
  mode: Mode = 'login';
  loading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder, private msg: MessageService) {}

  doLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value as { email: string; password: string };
    this.auth.login({ email, password }).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: (err) => { this.loading = false; this.msg.add({ severity: 'error', summary: 'Hiba', detail: err.error?.error || 'Belépési hiba' }); },
    });
  }

  doRegister() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    const v = this.registerForm.value as { name: string; email: string; password: string };
    this.auth.register(v).subscribe({
      next: () => { this.loading = false; this.msg.add({ severity: 'success', summary: 'Siker!', detail: 'Regisztráció sikeres, ellenőrizd az emailed!' }); this.router.navigate(['/dashboard']); },
      error: (err) => { this.loading = false; this.msg.add({ severity: 'error', summary: 'Hiba', detail: err.error?.error || 'Regisztrációs hiba' }); },
    });
  }

  doForgot() {
    if (this.forgotForm.invalid) return;
    this.loading = true;
    this.auth.forgotPassword(this.forgotForm.value.email as string).subscribe({
      next: () => { this.loading = false; this.msg.add({ severity: 'info', summary: 'Elküldve', detail: 'Ha létezik a fiók, elküldtük a linket.' }); this.mode = 'login'; },
      error: () => { this.loading = false; },
    });
  }
}
