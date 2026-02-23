import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BoxService } from '../../services/api.service';
import { Box, BoxContents } from '../../models/models';

@Component({
  selector: 'app-boxes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, DropdownModule, ProgressBarModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <div class="page-title"> Dobozaim</div>
          <div class="page-sub muted">{{ boxes.length }} doboz · kattints a részletekért</div>
        </div>
        <div class="header-actions">
          <select class="filter-select" [(ngModel)]="statusFilter" (change)="load()">
            <option value="">Minden státusz</option>
            <option value="ACTIVE">Aktív</option>
            <option value="ARCHIVED">Archivált</option>
            <option value="DAMAGED">Sérült</option>
          </select>
          <button pButton label="+ Új doboz" (click)="openCreate()"></button>
        </div>
      </div>

      <div *ngIf="loading" class="empty-state"> Betöltés…</div>

      <div *ngIf="!loading && !boxes.length" class="empty-state">
        <div style="font-size:40px;margin-bottom:12px;">📦</div>
        <div>Még nincsenek dobozok. Hozz létre egyet!</div>
      </div>

      <div class="boxes-grid" *ngIf="!loading && boxes.length">
        <div class="box-card" *ngFor="let box of boxes" (click)="openDetail(box)">
          <div class="box-card-header">
            <span class="box-code-badge">{{ box.code }}</span>
            <span class="status-badge {{ box.status }}">
              {{ box.status === 'ACTIVE' ? 'Aktív' : box.status === 'ARCHIVED' ? 'Archív' : 'Sérült' }}
            </span>
          </div>
          <div class="box-location muted"> {{ box.location || '–' }}</div>
          <div class="box-dims mono">
             {{ box.lengthCm }}×{{ box.widthCm }}×{{ box.heightCm }} cm &nbsp;|&nbsp;
             max {{ box.maxWeightKg }} kg
          </div>
          <div class="box-fills" *ngIf="box.fill">
            <div class="fill-bar-wrap">
              <span class="fill-label">Vol</span>
              <div class="mini-bar"><div class="mini-bar-inner" [style.width.%]="box.fill.volumeFillPercent" [style.background]="fillColor(box.fill.volumeFillPercent)"></div></div>
              <span class="fill-pct mono">{{ box.fill.volumeFillPercent }}%</span>
            </div>
            <div class="fill-bar-wrap" style="margin-top:5px;">
              <span class="fill-label">Súly</span>
              <div class="mini-bar"><div class="mini-bar-inner" [style.width.%]="box.fill.weightFillPercent" [style.background]="fillColor(box.fill.weightFillPercent)"></div></div>
              <span class="fill-pct mono">{{ box.fill.weightFillPercent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE/EDIT DIALOG -->
    <p-dialog [(visible)]="showForm" [modal]="true" [header]="editId ? '✏️ Doboz szerkesztése' : '📦 Új doboz'" [style]="{width:'480px'}">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kód *</label>
            <input pInputText formControlName="code" placeholder="pl. BOX-001" class="w-full"/>
          </div>
          <div class="form-group">
            <label class="form-label">Címke típus *</label>
            <select class="filter-select w-full" formControlName="labelType">
              <option value="QR">QR</option>
              <option value="BARCODE">Barcode</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Hossz (cm) *</label><input pInputText type="number" formControlName="lengthCm" placeholder="60" class="w-full"/></div>
          <div class="form-group"><label class="form-label">Szélesség (cm) *</label><input pInputText type="number" formControlName="widthCm" placeholder="40" class="w-full"/></div>
          <div class="form-group"><label class="form-label">Magasság (cm) *</label><input pInputText type="number" formControlName="heightCm" placeholder="30" class="w-full"/></div>
        </div>
        <div class="form-group">
          <label class="form-label">Max. teherbírás (kg) *</label>
          <input pInputText type="number" formControlName="maxWeightKg" placeholder="20" class="w-full"/>
        </div>
        <div class="form-group">
          <label class="form-label">Státusz *</label>
          <select class="filter-select w-full" formControlName="status">
            <option value="ACTIVE">Aktív</option>
            <option value="ARCHIVED">Archivált</option>
            <option value="DAMAGED">Sérült</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Helyszín</label>
          <input pInputText formControlName="location" placeholder="pl. Nappali / 2. polc" class="w-full"/>
        </div>
        <div class="form-group">
          <label class="form-label">Megjegyzés</label>
          <input pInputText formControlName="note" placeholder="Opcionális…" class="w-full"/>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="Mégse" class="p-button-outlined" (click)="showForm=false"></button>
        <button pButton [label]="editId ? 'Mentés' : 'Létrehozás →'" (click)="save()" [loading]="saving"></button>
      </ng-template>
    </p-dialog>

    <!-- DETAIL DIALOG -->
    <p-dialog [(visible)]="showDetail" [modal]="true" [header]="(detailBox?.code || '') + ' részletek'" [style]="{width:'540px'}">
      <div *ngIf="detailBox && detailBox.fill" class="detail-fills">
        <div class="fill-stat">
          <div class="fill-stat-label mono">TÉRFOGAT</div>
          <div class="fill-stat-val mono">{{ detailBox.fill.volumeFillPercent }}%</div>
          <div class="mini-bar full"><div class="mini-bar-inner" [style.width.%]="detailBox.fill.volumeFillPercent" [style.background]="fillColor(detailBox.fill.volumeFillPercent)"></div></div>
        </div>
        <div class="fill-stat">
          <div class="fill-stat-label mono">SÚLY</div>
          <div class="fill-stat-val mono">{{ detailBox.fill.weightFillPercent }}%</div>
          <div class="mini-bar full"><div class="mini-bar-inner" [style.width.%]="detailBox.fill.weightFillPercent" [style.background]="fillColor(detailBox.fill.weightFillPercent)"></div></div>
        </div>
      </div>

      <div class="detail-meta mono muted">
         {{ detailBox?.lengthCm }}×{{ detailBox?.widthCm }}×{{ detailBox?.heightCm }} cm &nbsp;·&nbsp;
         max {{ detailBox?.maxWeightKg }} kg &nbsp;·&nbsp;
         {{ detailBox?.location || '–' }}
      </div>

      <div class="detail-items-title"> Tartalom</div>

      <div *ngIf="!contents?.items?.length" class="empty-state small"> Ez a doboz üres</div>

      <div *ngFor="let item of contents?.items" class="content-item">
        <div class="content-item-info">
          <div style="font-weight:500;">{{ item.name }}</div>
          <div class="muted mono" style="font-size:11px;">{{ item.lengthCm }}×{{ item.widthCm }}×{{ item.heightCm }} cm · {{ item.weightKg }} kg</div>
        </div>
        <button pButton label="Kivesz" class="p-button-danger p-button-sm" (click)="removeItem(item.boxItemId)"></button>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="✏️ Szerkesztés" class="p-button-outlined" (click)="startEdit()"></button>
        <button pButton label="🗑️ Ürítés" class="p-button-outlined" (click)="emptyBox()"></button>
        <button pButton label="Törlés" class="p-button-danger" (click)="deleteBox()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .page-title { font-size: 20px; font-weight: 700; }
    .header-actions { display: flex; gap: 10px; align-items: center; }
    .filter-select { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--text); font-family: var(--font-sans); font-size: 13px; outline: none; cursor: pointer; }

    .boxes-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .box-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
    }
    .box-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .box-location { font-size: 12px; margin-bottom: 16px; }
    .box-dims { font-size: 11px; margin-bottom: 14px; padding: 8px 10px; background: var(--surface2); border-radius: 6px; }
    .box-fills { display: flex; flex-direction: column; gap: 5px; }
    .mini-bar { flex: 1; height: 5px; background: var(--surface2); border-radius: 3px; overflow: hidden; &.full { height: 4px; margin-top: 6px; } }
    .mini-bar-inner { height: 100%; border-radius: 3px; transition: width 0.5s; }
    .fill-label { font-size: 10px; font-family: var(--font-mono); color: var(--text-dim); width: 30px; text-transform: uppercase; }
    .fill-pct { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); width: 34px; text-align: right; }
    .fill-bar-wrap { display: flex; align-items: center; gap: 8px; }

    .empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; &.small { padding: 20px; } }

    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 5px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .w-full { width: 100%; }

    .detail-fills { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .fill-stat { background: var(--surface2); border-radius: 8px; padding: 12px; }
    .fill-stat-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .fill-stat-val { font-size: 22px; font-weight: 700; }
    .detail-meta { font-size: 12px; margin-bottom: 16px; }
    .detail-items-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .content-item { display: flex; align-items: center; gap: 12px; background: var(--surface2); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
    .content-item-info { flex: 1; }
  `],
})
export class BoxesComponent implements OnInit {
  boxes: Box[] = [];
  loading = true;
  statusFilter = '';
  showForm = false;
  showDetail = false;
  saving = false;
  editId: string | null = null;
  detailBox: Box | null = null;
  contents: BoxContents | null = null;

  form = this.fb.group({
    code: ['', Validators.required],
    labelType: ['QR', Validators.required],
    lengthCm: [null as number | null, [Validators.required, Validators.min(1)]],
    widthCm: [null as number | null, [Validators.required, Validators.min(1)]],
    heightCm: [null as number | null, [Validators.required, Validators.min(1)]],
    maxWeightKg: [null as number | null, [Validators.required, Validators.min(0.1)]],
    status: ['ACTIVE', Validators.required],
    location: [''],
    note: [''],
  });

  constructor(private boxSvc: BoxService, private fb: FormBuilder, private msg: MessageService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.boxSvc.getAll(this.statusFilter ? { status: this.statusFilter } : {}).subscribe({
      next: (data) => { this.boxes = data; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  openCreate() { this.editId = null; this.form.reset({ labelType: 'QR', status: 'ACTIVE' }); this.showForm = true; }

  startEdit() {
    if (!this.detailBox) return;
    this.editId = this.detailBox.id;
    this.form.patchValue({
      code: this.detailBox.code,
      labelType: this.detailBox.labelType,
      lengthCm: this.detailBox.lengthCm,
      widthCm: this.detailBox.widthCm,
      heightCm: this.detailBox.heightCm,
      maxWeightKg: this.detailBox.maxWeightKg,
      status: this.detailBox.status,
      location: this.detailBox.location || '',
      note: this.detailBox.note || '',
    });
    this.showDetail = false;
    this.showForm = true;
  }

  save() {
    if (this.form.invalid) { this.msg.add({ severity: 'warn', summary: 'Figyelem', detail: 'Töltsd ki a kötelező mezőket' }); return; }
    this.saving = true;
    const data = this.form.value as any;
    const obs = this.editId ? this.boxSvc.update(this.editId, data) : this.boxSvc.create(data);
    obs.subscribe({
      next: () => {
        this.saving = false; this.showForm = false;
        this.msg.add({ severity: 'success', summary: 'Siker!', detail: this.editId ? 'Doboz frissítve' : 'Doboz létrehozva!' });
        this.load();
      },
      error: (err) => { this.saving = false; this.msg.add({ severity: 'error', summary: 'Hiba', detail: err.error?.error || 'Hiba történt' }); },
    });
  }

  openDetail(box: Box) {
    this.detailBox = box;
    this.contents = null;
    this.showDetail = true;
    this.boxSvc.contents(box.id).subscribe({ next: (c) => this.contents = c });
  }

  removeItem(boxItemId: string) {
    if (!this.detailBox) return;
    this.openDetail(this.detailBox);
    this.msg.add({ severity: 'info', summary: '', detail: 'Tárgy kivéve' });
  }

  emptyBox() {
    if (!this.detailBox) return;
    this.boxSvc.empty(this.detailBox.id).subscribe({
      next: () => { this.msg.add({ severity: 'info', summary: 'Kiürítve', detail: 'A doboz kiürítve' }); this.showDetail = false; this.load(); },
    });
  }

  deleteBox() {
    if (!this.detailBox) return;
    this.boxSvc.delete(this.detailBox.id).subscribe({
      next: () => { this.msg.add({ severity: 'success', summary: 'Törölve', detail: 'Doboz törölve' }); this.showDetail = false; this.load(); },
      error: (err) => this.msg.add({ severity: 'error', summary: 'Hiba', detail: err.error?.error }),
    });
  }

  fillColor(pct: number) {
    if (pct >= 90) return '#ff4444';
    if (pct >= 70) return 'var(--accent2)';
    if (pct >= 40) return 'var(--accent)';
    return 'var(--accent3)';
  }
}