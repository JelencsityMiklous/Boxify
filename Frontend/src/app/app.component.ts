import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" [life]="3500"></p-toast>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
