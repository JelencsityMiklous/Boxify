import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: ``,
  styles: [
    `
   
  `,
  ],
})
export class LayoutComponent {}
