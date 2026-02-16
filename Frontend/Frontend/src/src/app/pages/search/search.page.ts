import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { SearchService } from '../../services/search.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, TableModule],
  template: `
    <h1 class="page-title">Search</h1>

    <div class="card" style="padding: 14px; margin-bottom: 12px;">
      <div class="row">
        <span class="p-input-icon-left w">
          <i class="pi pi-search"></i>
          <input pInputText class="w" placeholder="Tárgy neve (pl. kábel, töltő...)" [(ngModel)]="query" (keyup.enter)="doSearch()" />
        </span>
        <button pButton label="Keresés" icon="pi pi-search" (click)="doSearch()" [disabled]="!query"></button>
      </div>
    </div>

    <div class="card" style="padding: 10px;" *ngIf="results.length">
      <p-table [value]="results" [paginator]="true" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th>Item</th>
            <th>Box</th>
            <th>Location</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-r>
          <tr>
            <td>{{ r.item?.name || r.name }}</td>
            <td>{{ r.box?.code || '-' }}</td>
            <td>{{ r.box?.location || '-' }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <div *ngIf="!results.length && searched" style="color:#6b7280;">Nincs találat.</div>
  `,
  styles: [
    `
    .row{display:flex;gap:10px;align-items:center;}
    .w{width:100%;}
    @media (max-width: 700px){.row{flex-direction:column;align-items:stretch;}}
  `,
  ],
})
export class SearchPage {
  query = '';
  results: any[] = [];
  searched = false;

  constructor(private api: SearchService, private ms: MessageService) {}

  doSearch() {
    if (!this.query) return;
    this.api.searchItems(this.query).subscribe({
      next: (r) => {
        this.results = Array.isArray(r) ? r : [];
        this.searched = true;
      },
      error: (e) => {
        this.results = [];
        this.searched = true;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Keresés sikertelen' });
      },
    });
  }
}
