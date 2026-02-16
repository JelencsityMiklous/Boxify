import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';

import { ItemDto, ItemService } from '../../services/item.service';

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
    FileUploadModule,
  ],
  template: `
    <div class="header">
      <h1 class="page-title">Items</h1>
      <div class="actions">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText placeholder="Keresés név alapján" [(ngModel)]="search" (keyup.enter)="load()" />
        </span>
        <input pInputText placeholder="Kategória" [(ngModel)]="category" (keyup.enter)="load()" />
        <button pButton icon="pi pi-plus" label="Új item" (click)="openCreate()"></button>
      </div>
    </div>

    <div class="card" style="padding: 10px;">
      <p-table [value]="items" [paginator]="true" [rows]="10" [rowHover]="true" [loading]="loading" selectionMode="single" (onRowSelect)="openEdit($event.data)">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Dims (cm)</th>
            <th>Weight (kg)</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-i>
          <tr [pSelectableRow]="i">
            <td><strong>{{ i.name }}</strong></td>
            <td>{{ i.category || '-' }}</td>
            <td>{{ i.lengthCm }}×{{ i.widthCm }}×{{ i.heightCm }}</td>
            <td>{{ i.weightKg }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="editVisible" [modal]="true" [style]="{width:'560px'}" [header]="editMode==='create' ? 'Új item' : 'Item szerkesztés'">
      <form [formGroup]="form" class="form">
        <label>Név</label>
        <input pInputText formControlName="name" />

        <label>Kategória</label>
        <input pInputText formControlName="category" />

        <label>Leírás</label>
        <input pInputText formControlName="description" />

        <div class="grid3">
          <div><label>Hossz</label><input pInputText type="number" formControlName="lengthCm" /></div>
          <div><label>Szél</label><input pInputText type="number" formControlName="widthCm" /></div>
          <div><label>Mag</label><input pInputText type="number" formControlName="heightCm" /></div>
        </div>

        <label>Súly (kg)</label>
        <input pInputText type="number" formControlName="weightKg" />

        <div class="upload" *ngIf="editMode==='edit'">
          <div class="lbl">Kép feltöltés</div>
          <p-fileUpload mode="basic" name="image" [auto]="true" chooseLabel="Fájl kiválasztása" (onSelect)="onFileSelect($event)" accept="image/*"></p-fileUpload>
          <small class="hint">A backend /items/:id/upload-image endpointot hívja.</small>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button pButton label="Törlés" class="p-button-danger p-button-text" *ngIf="editMode==='edit'" (click)="remove()"></button>
        <button pButton label="Mégse" class="p-button-text" (click)="editVisible=false"></button>
        <button pButton label="Mentés" (click)="save()" [disabled]="form.invalid || saving"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
    .header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px;}
    .actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
    .form label{display:block;font-size:12px;color:#6b7280;margin:10px 0 6px;}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
    @media (max-width: 700px){.grid3{grid-template-columns:1fr;}}
    .upload{margin-top:12px;padding:10px;border:1px dashed var(--border);border-radius:12px;}
    .lbl{font-size:12px;color:#6b7280;margin-bottom:6px;}
    .hint{color:#9ca3af;}
  `,
  ],
})
export class ItemsPage {
  items: ItemDto[] = [];
  loading = false;

  search = '';
  category = '';

  editVisible = false;
  editMode: 'create' | 'edit' = 'create';
  editingId: string | null = null;
  saving = false;

  form = this.fb.group({
    name: ['', [Validators.required]],
    category: [''],
    description: [''],
    lengthCm: [10, [Validators.required, Validators.min(1)]],
    widthCm: [10, [Validators.required, Validators.min(1)]],
    heightCm: [10, [Validators.required, Validators.min(1)]],
    weightKg: [1, [Validators.required, Validators.min(0.01)]],
  });

  constructor(private fb: FormBuilder, private itemsApi: ItemService, private ms: MessageService) {
    this.load();
  }

  load() {
    this.loading = true;
    this.itemsApi.list({ search: this.search || undefined, category: this.category || undefined }).subscribe({
      next: (i) => {
        this.items = i;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Items betöltése sikertelen' });
      },
    });
  }

  openCreate() {
    this.editMode = 'create';
    this.editingId = null;
    this.form.reset({
      name: '',
      category: '',
      description: '',
      lengthCm: 10,
      widthCm: 10,
      heightCm: 10,
      weightKg: 1,
    });
    this.editVisible = true;
  }

  openEdit(item: ItemDto) {
    this.editMode = 'edit';
    this.editingId = item.id;
    this.form.reset({
      name: item.name,
      category: item.category || '',
      description: item.description || '',
      lengthCm: item.lengthCm,
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      weightKg: item.weightKg,
    });
    this.editVisible = true;
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    this.saving = true;

    const req = this.editMode === 'create'
      ? this.itemsApi.create(payload)
      : this.itemsApi.update(this.editingId!, payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.editVisible = false;
        this.ms.add({ severity: 'success', summary: 'OK', detail: 'Mentve' });
        this.load();
      },
      error: (e) => {
        this.saving = false;
        this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Mentés sikertelen' });
      },
    });
  }

  remove() {
    if (!this.editingId) return;
    this.itemsApi.remove(this.editingId).subscribe({
      next: () => {
        this.ms.add({ severity: 'success', summary: 'OK', detail: 'Törölve' });
        this.editVisible = false;
        this.load();
      },
      error: (e) => this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Törlés sikertelen' }),
    });
  }

  onFileSelect(ev: any) {
    if (!this.editingId) return;
    const file: File | undefined = ev?.files?.[0];
    if (!file) return;

    this.itemsApi.uploadImage(this.editingId, file).subscribe({
      next: () => this.ms.add({ severity: 'success', summary: 'OK', detail: 'Kép feltöltve' }),
      error: (e) => this.ms.add({ severity: 'error', summary: 'Hiba', detail: e?.error?.message || 'Feltöltés sikertelen' }),
    });
  }
}
