import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ItemService, ItemDto } from '../../services/item.service';
import { PackingService } from '../../services/packing.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, InputNumberModule, ButtonModule, CardModule],
  template: `
    <h1 class="page-title">Packing</h1>

    <div class="card" style="padding: 14px; margin-bottom: 12px;">
      <div class="grid">
        <div>
          <label>Item</label>
          <p-dropdown
            [options]="itemOptions"
            [(ngModel)]="selectedItemId"
            optionLabel="label"
            optionValue="value"
            placeholder="Válassz tárgyat"
            (onChange)="recommend()"
            styleClass="w"
          ></p-dropdown>
        </div>

        <div>
          <label>Mennyiség</label>
          <p-inputNumber [(ngModel)]="quantity" [min]="1" [showButtons]="true" (onInput)="recommend()"></p-inputNumber>
        </div>

        <div class="btn">
          <button pButton label="Ajánlás frissítése" icon="pi pi-refresh" (click)="recommend()" [disabled]="!selectedItemId"></button>
        </div>
      </div>
    </div>

    <div *ngIf="loading" style="color:#6b7280;">Betöltés…</div>

    <div class="cards" *ngIf="!loading">
      <p-card *ngFor="let b of recommended" styleClass="rec-card" [header]="b.code">
        <div class="meta">Hely: {{ b.location || '-' }}</div>
        <div class="meta">Méret: {{ b.lengthCm }}×{{ b.widthCm }}×{{ b.heightCm }} cm</div>
        <div class="meta">Max: {{ b.maxWeightKg }} kg</div>
        <div class="meta" *ngIf="b.reason">Megjegyzés: {{ b.reason }}</div>

        <button pButton label="Pakolás ebbe" icon="pi pi-arrow-right" class="mt" (click)="put(b.id)"></button>
      </p-card>
    </div>

    <div *ngIf="!loading && selectedItemId && recommended.length===0" style="color:#6b7280;">
      Nincs megfelelő doboz ehhez a tárgyhoz.
    </div>
  `,
  styles: [
    `
    label{display:block;font-size:12px;color:#6b7280;margin-bottom:6px;}
    .grid{display:grid;grid-template-columns:2fr 1fr auto;gap:12px;align-items:end;}
    .btn{display:flex;justify-content:flex-end;}
    .w{width:100%;}
    @media (max-width: 900px){.grid{grid-template-columns:1fr;}.btn{justify-content:flex-start;}}
    .cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
    @media (max-width: 1100px){.cards{grid-template-columns:repeat(2,1fr);}}
    @media (max-width: 700px){.cards{grid-template-columns:1fr;}}
    .meta{font-size:13px;color:#374151;margin:4px 0;}
    .mt{margin-top:10px; width:100%;}
  `,
  ],
})
export class PackingPage {
  items: ItemDto[] = [];
  itemOptions: Array<{ label: string; value: string }> = [];

  selectedItemId: string | null = null;
  quantity = 1;

  recommended: any[] = [];
  loading = false;

  constructor(private itemsApi: ItemService, private packingApi: PackingService, private ms: MessageService) {
    this.itemsApi.list().subscribe({
      next: (i) => {
        this.items = i;
        this.itemOptions = i.map(x => ({ label: x.name, value: x.id }));
      },
      error: () => {
        this.items = [];
        this.itemOptions = [];
      }
    });
  }

  recommend() {
    if (!this.selectedItemId) return;
    this.loading = true;
    this.packingApi.recommend(this.selectedItemId, this.quantity || 1).subscribe({
      next: (r) => {
        this.recommended = Array.isArray(r) ? r : [];
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Ajánlás sikertelen' });
      },
    });
  }

  put(boxId: string) {
    if (!this.selectedItemId) return;
    this.packingApi.put({ boxId, itemId: this.selectedItemId, quantity: this.quantity || 1 }).subscribe({
      next: () => {
        this.ms.add({ severity: 'success', summary: 'OK', detail: 'Bepakolva' });
        // frissítjük az ajánlást (telítettség változhat)
        this.recommend();
      },
      error: (e) => {
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Pakolás sikertelen' });
      },
    });
  }
}
