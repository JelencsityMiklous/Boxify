import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ItemService } from '../../services/api.service';
import { Item } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <div class="page-title"> Tárgyaim</div>
          <div class="page-sub muted">{{ items.length }} tárgy</div>
        </div>
        <div class="header-actions">
          <input class="search-input" type="text" placeholder="🔍 Keresés…" [(ngModel)]="searchQ" (input)="onSearch()"/>
          <select class="filter-select" [(ngModel)]="catFilter" (change)="load()">
            <option value="">Minden kategória</option>
            <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
          </select>
          <button pButton label="+ Új tárgy" (click)="openCreate()"></button>
        </div>
      </div>

      <div class="bx-card">
        <p-table [value]="items" [loading]="loading" [paginator]="items.length > 15" [rows]="15" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Tárgy</th>
              <th>Kategória</th>
              <th>Méret (cm)</th>
              <th>Súly</th>
              <th>Doboz</th>
              <th>Műveletek</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>
                <div class="item-name-cell">
                  <div class="item-thumb" *ngIf="!item.imagePath">{{ getCategoryEmoji(item.category) }}</div>
                  <img *ngIf="item.imagePath" [src]="uploadsUrl + '/' + item.imagePath.split('/').pop()" class="item-thumb-img" alt=""/>
                  <div>
                    <div style="font-weight:500;">{{ item.name }}</div>
                    <div class="muted mono" style="font-size:11px;">{{ item.description || '' }}</div>
                  </div>
                </div>
              </td>
              <td><span class="cat-badge">{{ item.category || '–' }}</span></td>
              <td class="mono muted" style="font-size:12px;">{{ item.lengthCm }}×{{ item.widthCm }}×{{ item.heightCm }}</td>
              <td class="mono" style="font-size:13px;">{{ item.weightKg }} kg</td>
              <td>
                <span *ngIf="item.box" class="box-code-badge" style="font-size:11px;">{{ item.box.code }}</span>
                <span *ngIf="!item.box" class="muted" style="font-size:12px;">–</span>
              </td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button pButton icon="pi pi-pencil" class="p-button-outlined p-button-sm" (click)="openEdit(item)"></button>
                  <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteItem(item)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nincs tárgy ebben a kategóriában</td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- CREATE/EDIT DIALOG -->
    <p-dialog [(visible)]="showForm" [modal]="true" [header]="editId ? '✏️ Tárgy szerkesztése' : '🏷️ Új tárgy'" [style]="{width:'480px'}">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-group">
          <label class="form-label">Tárgy neve *</label>
          <input pInputText formControlName="name" placeholder="pl. Téli kabát" class="w-full"/>
        </div>
        <div class="form-group">
          <label class="form-label">Kategória</label>
          <select class="filter-select w-full" formControlName="category">
            <option value="">– Válassz –</option>
            <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Leírás</label>
          <input pInputText formControlName="description" placeholder="Opcionális…" class="w-full"/>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Hossz (cm) *</label><input pInputText type="number" formControlName="lengthCm" placeholder="30" class="w-full"/></div>
          <div class="form-group"><label class="form-label">Szélesség (cm) *</label><input pInputText type="number" formControlName="widthCm" placeholder="20" class="w-full"/></div>
          <div class="form-group"><label class="form-label">Magasság (cm) *</label><input pInputText type="number" formControlName="heightCm" placeholder="10" class="w-full"/></div>
        </div>
        <div class="form-group">
          <label class="form-label">Súly (kg) *</label>
          <input pInputText type="number" step="0.01" formControlName="weightKg" placeholder="1.5" class="w-full"/>
        </div>
        <div *ngIf="editId" class="form-group">
          <label class="form-label">Kép feltöltése</label>
          <input type="file" accept="image/*" (change)="onFileChange($event)" class="file-input"/>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="Mégse" class="p-button-outlined" (click)="showForm=false"></button>
        <button pButton [label]="editId ? 'Mentés' : 'Hozzáadás →'" (click)="save()" [loading]="saving"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .page-title { font-size: 20px; font-weight: 700; }
    .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .search-input { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; color: var(--text); font-family: var(--font-sans); font-size: 13px; outline: none; &:focus { border-color: var(--accent); } &::placeholder { color: var(--text-dim); } }
    .filter-select { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--text); font-family: var(--font-sans); font-size: 13px; outline: none; cursor: pointer; }

    .item-name-cell { display: flex; align-items: center; gap: 10px; }
    .item-thumb { width: 36px; height: 36px; border-radius: 6px; background: var(--surface2); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .item-thumb-img { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; }
    .cat-badge { font-size: 11px; font-family: var(--font-mono); padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.06); color: var(--text-muted); }

    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 5px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .w-full { width: 100%; }
    .file-input { color: var(--text-muted); font-size: 13px; }
  `],
})
export class ItemsComponent implements OnInit {
  items: Item[] = [];
  loading = true;
  saving = false;
  showForm = false;
  editId: string | null = null;
  searchQ = '';
  catFilter = '';
  selectedFile: File | null = null;
  uploadsUrl = environment.uploadsUrl;

  categories = ['Elektronika', 'Ruházat', 'Könyvek', 'Sportszer', 'Konyhai eszköz', 'Szerszám', 'Egyéb'];

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    category: [''],
    lengthCm: [null as number | null, [Validators.required, Validators.min(0.1)]],
    widthCm: [null as number | null, [Validators.required, Validators.min(0.1)]],
    heightCm: [null as number | null, [Validators.required, Validators.min(0.1)]],
    weightKg: [null as number | null, [Validators.required, Validators.min(0.001)]],
  });

  constructor(private itemSvc: ItemService, private fb: FormBuilder, private msg: MessageService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.itemSvc.getAll({ category: this.catFilter, search: this.searchQ }).subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  onSearch() { clearTimeout((this as any)._st); (this as any)._st = setTimeout(() => this.load(), 350); }

  openCreate() { this.editId = null; this.form.reset(); this.showForm = true; }

  openEdit(item: Item) {
    this.editId = item.id;
    this.form.patchValue({ name: item.name, description: item.description || '', category: item.category || '', lengthCm: item.lengthCm, widthCm: item.widthCm, heightCm: item.heightCm, weightKg: item.weightKg });
    this.showForm = true;
  }

  save() {
    if (this.form.invalid) { this.msg.add({ severity: 'warn', summary: 'Figyelem', detail: 'Töltsd ki a kötelező mezőket' }); return; }
    this.saving = true;
    const data = this.form.value as any;
    const obs = this.editId ? this.itemSvc.update(this.editId, data) : this.itemSvc.create(data);
    obs.subscribe({
      next: (item) => {
        if (this.selectedFile && this.editId) {
          this.itemSvc.uploadImage(item.id || this.editId!, this.selectedFile).subscribe();
        }
        this.saving = false; this.showForm = false;
        this.msg.add({ severity: 'success', summary: 'Siker!', detail: this.editId ? 'Tárgy frissítve' : 'Tárgy létrehozva!' });
        this.load();
      },
      error: (err) => { this.saving = false; this.msg.add({ severity: 'error', summary: 'Hiba', detail: err.error?.error || 'Hiba' }); },
    });
  }

  deleteItem(item: Item) {
    this.itemSvc.delete(item.id).subscribe({
      next: () => { this.msg.add({ severity: 'success', summary: 'Törölve', detail: `${item.name} törölve` }); this.load(); },
    });
  }

  onFileChange(e: Event) { this.selectedFile = (e.target as HTMLInputElement).files?.[0] || null; }

  getCategoryEmoji(cat?: string) {
    const map: Record<string, string> = { 'Elektronika': '💻', 'Ruházat': '👕', 'Könyvek': '📚', 'Sportszer': '⚽', 'Konyhai eszköz': '🍳', 'Szerszám': '🔨', 'Egyéb': '📦' };
    return map[cat || ''] || '📦';
  }
}
