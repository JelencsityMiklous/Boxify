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
    `,
  styles: [
    `
   
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
    const v = this.form.getRawValue();
const payload = {
  name: v.name ?? undefined,
  category: v.category ?? undefined,
  description: v.description ?? undefined,
  lengthCm: v.lengthCm ?? undefined,
  widthCm: v.widthCm ?? undefined,
  heightCm: v.heightCm ?? undefined,
  weightKg: v.weightKg ?? undefined,
};

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
