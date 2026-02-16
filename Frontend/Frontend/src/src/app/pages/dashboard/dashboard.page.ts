import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { BoxService } from '../../services/box.service';
import { ItemService } from '../../services/item.service';

@Component({
  standalone: true,
  imports: [CardModule],
  template: `
    <h1 class="page-title">Dashboard</h1>

    <div class="grid">
      <div class="card p">
        <div class="k">Dobozok</div>
        <div class="v">{{ boxesCount }}</div>
      </div>
      <div class="card p">
        <div class="k">Tárgyak</div>
        <div class="v">{{ itemsCount }}</div>
      </div>
      <div class="card p">
        <div class="k">Tipp</div>
        <div class="small">Boxes oldalon kattints egy sorra a Contents megnyitásához.</div>
      </div>
    </div>
  `,
  styles: [
    `
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}
    @media (max-width: 900px){.grid{grid-template-columns:1fr;}}
    .p{padding:14px;}
    .k{font-size:12px;color:#6b7280;margin-bottom:6px;}
    .v{font-size:28px;font-weight:800;}
    .small{font-size:13px;color:#374151;}
  `,
  ],
})
export class DashboardPage {
  boxesCount = 0;
  itemsCount = 0;

  constructor(boxes: BoxService, items: ItemService) {
    boxes.list().subscribe({ next: (b) => (this.boxesCount = b.length), error: () => (this.boxesCount = 0) });
    items.list().subscribe({ next: (i) => (this.itemsCount = i.length), error: () => (this.itemsCount = 0) });
  }
}
