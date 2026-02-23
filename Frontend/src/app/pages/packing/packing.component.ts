import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ItemService, BoxService, PackingService } from '../../services/api.service';
import { Item, Box, RecommendResult } from '../../models/models';

@Component({
  selector: 'app-packing',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, ToastModule],
  providers: [MessageService],
  template: `
    `,
  styles: [`
   `],
})
export class PackingComponent implements OnInit {
  items: Item[] = [];
  boxes: Box[] = [];
  recommendations: RecommendResult[] = [];
  selectedItemId = '';
  selectedBoxId = '';
  selectedItem: Item | null = null;
  fitResult: any = null;
  qty = 1;
  packing = false;
  loadingRec = false;

  constructor(
    private itemSvc: ItemService,
    private boxSvc: BoxService,
    private packingSvc: PackingService,
    private msg: MessageService,
  ) {}

  ngOnInit() {
    this.itemSvc.getAll().subscribe(d => this.items = d);
    this.boxSvc.getAll({ status: 'ACTIVE' }).subscribe(d => this.boxes = d);
  }

  decQty() { if (this.qty > 1) { this.qty--; this.updateRecommend(); } }
  incQty() { this.qty++; this.updateRecommend(); }

  onItemSelect() {
    this.selectedItem = this.items.find(i => i.id === this.selectedItemId) || null;
    this.fitResult = null;
    this.selectedBoxId = '';
    this.updateRecommend();
  }

  onBoxSelect() {
    if (!this.selectedItemId || !this.selectedBoxId) return;
    this.packingSvc.canFit(this.selectedBoxId, this.selectedItemId, this.qty).subscribe({
      next: (r) => this.fitResult = r,
    });
  }

  updateRecommend() {
    if (!this.selectedItemId) return;
    this.loadingRec = true;
    this.recommendations = [];
    this.packingSvc.recommend(this.selectedItemId, this.qty).subscribe({
      next: (r) => { this.recommendations = r; this.loadingRec = false; },
      error: () => this.loadingRec = false,
    });
  }

  selectRec(r: RecommendResult) {
    this.selectedBoxId = r.box.id;
    this.onBoxSelect();
  }

  doPack() {
    if (!this.selectedItemId || !this.selectedBoxId) return;
    this.packing = true;
    this.packingSvc.put(this.selectedBoxId, this.selectedItemId, this.qty).subscribe({
      next: (r) => {
        this.packing = false;
        if (r.ok) {
          this.msg.add({ severity: 'success', summary: ' Bepakolva!', detail: `Sikeresen elhelyezve a dobozban` });
          this.selectedItem = null; this.selectedItemId = ''; this.selectedBoxId = ''; this.recommendations = []; this.fitResult = null;
          this.itemSvc.getAll().subscribe(d => this.items = d);
        } else {
          this.fitResult = r;
          this.msg.add({ severity: 'error', summary: 'Nem fér be', detail: r.reasons?.[0]?.message || 'Limit túllépés' });
        }
      },
      error: (err) => {
        this.packing = false;
        this.msg.add({ severity: 'error', summary: 'Hiba', detail: err.error?.reasons?.[0]?.message || err.error?.error });
      },
    });
  }

  getCatEmoji(cat?: string) {
    const map: Record<string, string> = { 'Elektronika': '💻', 'Ruházat': '👕', 'Könyvek': '📚', 'Sportszer': '⚽', 'Konyhai eszköz': '🍳', 'Szerszám': '🔨' };
    return map[cat || ''] || '📦';
  }
}
