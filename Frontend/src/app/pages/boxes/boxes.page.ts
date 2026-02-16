import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { BoxDto, BoxService } from '../../services/box.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ProgressBarModule,
    TagModule,
  ],
  template: `
    <div class="header">
      <h1 class="page-title">Boxes</h1>
      <div class="actions">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText placeholder="Keresés (code / location)" [(ngModel)]="search" (keyup.enter)="load()" />
        </span>
        <p-dropdown [options]="statusOptions" [(ngModel)]="status" placeholder="Státusz" (onChange)="load()"></p-dropdown>
        <button pButton icon="pi pi-plus" label="Új doboz" (click)="openCreate()"></button>
      </div>
    </div>

    <div class="card" style="padding: 10px;">
      <p-table
        [value]="boxes"
        [paginator]="true"
        [rows]="10"
        [rowHover]="true"
        selectionMode="single"
        (onRowSelect)="openContents($event.data)"
        [loading]="loading"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Code</th>
            <th>Location</th>
            <th>Dims (cm)</th>
            <th>Max kg</th>
            <th>Status</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-b>
          <tr [pSelectableRow]="b">
            <td><strong>{{ b.code }}</strong></td>
            <td>{{ b.location || '-' }}</td>
            <td>{{ b.lengthCm }}×{{ b.widthCm }}×{{ b.heightCm }}</td>
            <td>{{ b.maxWeightKg }}</td>
            <td><p-tag [value]="b.status || 'ACTIVE'"></p-tag></td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Create/Edit dialog -->
    <p-dialog [(visible)]="editVisible" [modal]="true" [style]="{width:'520px'}" [header]="editMode==='create' ? 'Új doboz' : 'Doboz szerkesztés'">
      <form [formGroup]="form" class="form">
        <div class="grid2">
          <div>
            <label>Code</label>
            <input pInputText formControlName="code" placeholder="BOX-XXXXXX (opcionális)" />
            <small class="hint">Ha üres, a backend generálhat.</small>
          </div>
          <div>
            <label>Location</label>
            <input pInputText formControlName="location" placeholder="Pl. Polc A / Szoba" />
          </div>
        </div>

        <div class="grid3">
          <div><label>Hossz</label><input pInputText type="number" formControlName="lengthCm" /></div>
          <div><label>Szél</label><input pInputText type="number" formControlName="widthCm" /></div>
          <div><label>Mag</label><input pInputText type="number" formControlName="heightCm" /></div>
        </div>

        <div class="grid2">
          <div>
            <label>Max teher (kg)</label>
            <input pInputText type="number" formControlName="maxWeightKg" />
          </div>
          <div>
            <label>Status</label>
            <p-dropdown [options]="statusEditOptions" formControlName="status"></p-dropdown>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button pButton label="Mégse" class="p-button-text" (click)="editVisible=false"></button>
        <button pButton label="Mentés" (click)="save()" [disabled]="form.invalid || saving"></button>
      </ng-template>
    </p-dialog>

    <!-- Contents dialog -->
    <p-dialog [(visible)]="contentsVisible" [modal]="true" [style]="{width:'760px'}" header="Doboz tartalma">
      <ng-container *ngIf="contents">
        <div class="meta">
          <div><strong>{{ contents.box?.code }}</strong> • {{ contents.box?.location || '-' }}</div>
          <div class="badges">
            <p-tag [value]="contents.box?.status || 'ACTIVE'"></p-tag>
          </div>
        </div>

        <div class="fills">
          <div>
            <div class="lbl">Súly telítettség</div>
            <p-progressBar [value]="contents.weightFillPercent || 0"></p-progressBar>
          </div>
          <div>
            <div class="lbl">Térfogat telítettség</div>
            <p-progressBar [value]="contents.volumeFillPercent || 0"></p-progressBar>
          </div>
        </div>

        <div class="btnrow">
          <button pButton label="Szerkesztés" icon="pi pi-pencil" class="p-button-outlined" (click)="openEdit(contents.box)"></button>
          <button pButton label="Ürítés" icon="pi pi-trash" class="p-button-warning" (click)="emptyBox(contents.box.id)"></button>
          <button pButton label="Archiválás" icon="pi pi-folder" class="p-button-secondary" (click)="archiveBox(contents.box.id)"></button>
        </div>

        <p-table [value]="contents.items || []" [rows]="8" [paginator]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Weight (kg)</th>
              <th>Volume (cm³)</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr>
              <td>{{ row.item?.name || row.name }}</td>
              <td>{{ row.item?.category || row.category || '-' }}</td>
              <td>{{ row.quantity || 1 }}</td>
              <td>{{ row.item?.weightKg || row.weightKg }}</td>
              <td>{{ row.itemVolume || row.volume || '-' }}</td>
            </tr>
          </ng-template>
        </p-table>
      </ng-container>

      <ng-container *ngIf="!contents && !contentsLoading">
        <div style="color:#6b7280;">Nincs adat.</div>
      </ng-container>

      <ng-container *ngIf="contentsLoading">
        <div style="color:#6b7280;">Betöltés…</div>
      </ng-container>
    </p-dialog>
  `,
  styles: [
    `
    .header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px;}
    .actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
    .form label{display:block;font-size:12px;color:#6b7280;margin:10px 0 6px;}
    .hint{display:block;color:#9ca3af;margin-top:4px;}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
    @media (max-width: 700px){.grid2,.grid3{grid-template-columns:1fr;}}
    .meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
    .fills{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0 12px;}
    @media (max-width: 700px){.fills{grid-template-columns:1fr;}}
    .lbl{font-size:12px;color:#6b7280;margin-bottom:6px;}
    .btnrow{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;}
  `,
  ],
})
export class BoxesPage {
  boxes: BoxDto[] = [];
  loading = false;

  search = '';
  status: string | null = null;
  statusOptions = [
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'ARCHIVED', value: 'ARCHIVED' },
    { label: 'DAMAGED', value: 'DAMAGED' },
  ];
  statusEditOptions = [
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'ARCHIVED', value: 'ARCHIVED' },
    { label: 'DAMAGED', value: 'DAMAGED' },
  ];

  editVisible = false;
  editMode: 'create' | 'edit' = 'create';
  editingId: string | null = null;
  saving = false;

  contentsVisible = false;
  contentsLoading = false;
  contents: any = null;

  form = this.fb.group({
    code: [''],
    location: [''],
    lengthCm: [30, [Validators.required, Validators.min(1)]],
    widthCm: [30, [Validators.required, Validators.min(1)]],
    heightCm: [30, [Validators.required, Validators.min(1)]],
    maxWeightKg: [10, [Validators.required, Validators.min(0.1)]],
    status: ['ACTIVE'],
  });

  constructor(private fb: FormBuilder, private boxesApi: BoxService, private ms: MessageService) {
    this.load();
  }

  load() {
    this.loading = true;
    this.boxesApi.list({ search: this.search || undefined, status: this.status || undefined }).subscribe({
      next: (b) => {
        this.boxes = b;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Boxes betöltése sikertelen' });
      },
    });
  }

  openCreate() {
    this.editMode = 'create';
    this.editingId = null;
    this.form.reset({
      code: '',
      location: '',
      lengthCm: 30,
      widthCm: 30,
      heightCm: 30,
      maxWeightKg: 10,
      status: 'ACTIVE',
    });
    this.editVisible = true;
  }

  openEdit(box: any) {
    this.editMode = 'edit';
    this.editingId = box?.id;
    this.form.reset({
      code: box?.code || '',
      location: box?.location || '',
      lengthCm: box?.lengthCm,
      widthCm: box?.widthCm,
      heightCm: box?.heightCm,
      maxWeightKg: box?.maxWeightKg,
      status: box?.status || 'ACTIVE',
    });
    this.editVisible = true;
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    this.saving = true;

    const req = this.editMode === 'create'
      ? this.boxesApi.create(payload)
      : this.boxesApi.update(this.editingId!, payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.editVisible = false;
        this.ms.add({ severity: 'success', summary: 'OK', detail: 'Mentve' });
        this.load();
        if (this.contentsVisible && this.contents?.box?.id) this.openContents({ id: this.contents.box.id });
      },
      error: (e) => {
        this.saving = false;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Mentés sikertelen' });
      },
    });
  }

  openContents(box: any) {
    if (!box?.id) return;
    this.contentsVisible = true;
    this.contentsLoading = true;
    this.contents = null;

    this.boxesApi.contents(box.id).subscribe({
      next: (c) => {
        this.contents = c;
        this.contentsLoading = false;
      },
      error: (e) => {
        this.contentsLoading = false;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Contents betöltése sikertelen' });
      },
    });
  }

  emptyBox(id: string) {
    this.boxesApi.empty(id).subscribe({
      next: () => {
        this.ms.add({ severity: 'success', summary: 'OK', detail: 'Doboz ürítve' });
        this.openContents({ id });
      },
      error: (e) => this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Nem sikerült üríteni' }),
    });
  }

  archiveBox(id: string) {
    this.boxesApi.archive(id).subscribe({
      next: () => {
        this.ms.add({ severity: 'success', summary: 'OK', detail: 'Archiválva' });
        this.contentsVisible = false;
        this.load();
      },
      error: (e) => this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Nem sikerült archiválni' }),
    });
  }
}
