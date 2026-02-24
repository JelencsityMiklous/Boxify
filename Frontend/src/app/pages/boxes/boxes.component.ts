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
  templateUrl: './boxes.component.html',
  styleUrls: ['./boxes.component.scss'],
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