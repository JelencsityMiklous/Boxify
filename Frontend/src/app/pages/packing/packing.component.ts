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
    <p-toast position="bottom-right"></p-toast>
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <div class="page-title"> Pakolás</div>
          <div class="page-sub muted">Válassz tárgyat, a rendszer ajánl dobozt</div>
        </div>
      </div>

      <div class="packing-layout">
        <div class="packing-left">
          <!-- STEP 1 -->
          <div class="bx-card" style="margin-bottom:16px;">
            <div class="step-header">
              <div class="step-num">1</div>
              <div class="step-title">Tárgy kiválasztása</div>
            </div>
            <div class="bx-card-body">
              <select class="big-select" [(ngModel)]="selectedItemId" (change)="onItemSelect()">
                <option value="">– Válassz tárgyat –</option>
                <option *ngFor="let i of items" [value]="i.id">{{ getCatEmoji(i.category) }} {{ i.name }}</option>
              </select>

              <div class="qty-row">
                <span class="muted" style="font-size:13px;">Mennyiség:</span>
                <button class="qty-btn" (click)="decQty()">−</button>
                <span class="qty-val mono">{{ qty }}</span>
                <button class="qty-btn" (click)="incQty()">+</button>
              </div>

              <div class="item-preview" *ngIf="selectedItem">
                <div style="font-weight:600;margin-bottom:6px;">{{ getCatEmoji(selectedItem.category) }} {{ selectedItem.name }}</div>
                <div class="muted mono" style="font-size:11px;">
                  {{ selectedItem.lengthCm }}×{{ selectedItem.widthCm }}×{{ selectedItem.heightCm }} cm &nbsp;·&nbsp;
                  {{ selectedItem.weightKg }} kg &nbsp;·&nbsp;
                  {{ selectedItem.category || 'Egyéb' }}
                  <span *ngIf="selectedItem.box" style="color:var(--accent3)"> · jelenleg: {{ selectedItem.box.code }}</span>
                </div>
              </div>

              <div *ngIf="fitResult" class="fit-check" [class]="fitResult.ok ? 'ok' : 'err'">
                <span class="fit-icon">{{ fitResult.ok ? '✅' : '❌' }}</span>
                <div>
                  <div *ngIf="fitResult.ok">Elfér a kiválasztott dobozban!</div>
                  <div *ngIf="!fitResult.ok">
                    <strong>Nem fér be:</strong>
                    <div *ngFor="let r of fitResult.reasons" style="font-size:12px;margin-top:4px;">• {{ r.message }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2 -->
          <div class="bx-card">
            <div class="step-header">
              <div class="step-num">2</div>
              <div class="step-title">Doboz kiválasztása</div>
            </div>
            <div class="bx-card-body">
              <select class="big-select" [(ngModel)]="selectedBoxId" (change)="onBoxSelect()">
                <option value="">– Válassz dobozt –</option>
                <option *ngFor="let b of boxes" [value]="b.id">[{{ b.code }}] {{ b.name }}</option>
              </select>
              <button pButton label=" Bepakolás!" style="width:100%;justify-content:center;margin-top:12px;" (click)="doPack()" [loading]="packing" [disabled]="!selectedItemId || !selectedBoxId"></button>
            </div>
          </div>
        </div>

        <!-- RECOMMENDATIONS -->
        <div class="bx-card">
          <div class="step-header">
            <div class="step-num" style="background:var(--surface2);color:var(--text);">💡</div>
            <div class="step-title">Ajánlott dobozok</div>
          </div>
          <div class="bx-card-body">
            <div *ngIf="!selectedItemId" class="empty-state">
              <div style="font-size:32px;margin-bottom:10px;">📦</div>
              <div>Válassz tárgyat az ajánláshoz</div>
            </div>
            <div *ngIf="selectedItemId && !recommendations.length && !loadingRec" class="empty-state">
              <div style="font-size:32px;margin-bottom:10px;">⚠️</div>
              <div>Egyik dobozba sem fér el. Adj hozzá nagyobb dobozt!</div>
            </div>
            <div *ngIf="loadingRec" class="empty-state">Keresés…</div>

            <div class="recommend-list">
              <div class="rec-item" *ngFor="let r of recommendations; let i = index"
                   [class.selected]="selectedBoxId === r.box.id"
                   (click)="selectRec(r)">
                <div class="rec-left">
                  <div class="box-code-badge">{{ r.box.code }}</div>
                  <div style="font-size:13px;font-weight:500;margin-top:6px;">{{ r.box.name }}</div>
                  <div class="muted" style="font-size:11px;">📍 {{ r.box.location || '–' }}</div>
                </div>
                <div class="rec-right">
                  <div class="muted mono" style="font-size:11px;margin-bottom:4px;">{{ r.fill.volumeFillPercent }}% teli</div>
                  <span class="rec-tag" [class]="i === 0 ? 'best' : 'good'">{{ i === 0 ? 'Ajánlott' : 'OK' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .page-title { font-size: 20px; font-weight: 700; }

    .packing-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .packing-left { display: flex; flex-direction: column; }

    .step-header { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border); }
    .step-num { width: 24px; height: 24px; border-radius: 50%; background: var(--accent); color: #000; font-family: var(--font-mono); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-title { font-size: 14px; font-weight: 600; }

    .big-select { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); font-family: var(--font-sans); font-size: 13px; outline: none; cursor: pointer; margin-bottom: 14px; &:focus { border-color: var(--accent); } }

    .qty-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .qty-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; &:hover { border-color: var(--accent); color: var(--accent); } }
    .qty-val { font-size: 18px; font-weight: 700; min-width: 24px; text-align: center; }

    .item-preview { background: var(--surface2); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; }

    .fit-check { padding: 12px 14px; border-radius: 8px; border: 1px solid; display: flex; align-items: flex-start; gap: 10px; font-size: 13px;
      &.ok { background: rgba(77,255,180,0.06); border-color: rgba(77,255,180,0.2); color: var(--accent3); }
      &.err { background: rgba(255,80,80,0.06); border-color: rgba(255,80,80,0.2); color: #ff6b6b; }
    }
    .fit-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

    .recommend-list { display: flex; flex-direction: column; gap: 10px; }
    .rec-item { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 14px; display: flex; align-items: flex-start; gap: 12px; cursor: pointer; transition: all 0.15s;
      &:hover { border-color: var(--accent3); }
      &.selected { border-color: var(--accent); background: rgba(232,255,71,0.05); }
    }
    .rec-left { flex: 1; }
    .rec-right { text-align: right; }
    .rec-tag { font-size: 10px; font-family: var(--font-mono); padding: 2px 6px; border-radius: 4px;
      &.best { background: rgba(77,255,180,0.12); color: var(--accent3); }
      &.good { background: rgba(232,255,71,0.1); color: var(--accent); }
    }

    .empty-state { text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px; }
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
