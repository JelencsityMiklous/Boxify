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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
