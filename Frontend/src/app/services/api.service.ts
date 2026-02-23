import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Box, Item, BoxContents, PackResult, RecommendResult, StatsOverview } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BoxService {
  private api = `${environment.apiUrl}/boxes`;
  constructor(private http: HttpClient) {}

  getAll(params?: { status?: string; search?: string }) {
    let p = new HttpParams();
    if (params?.status) p = p.set('status', params.status);
    if (params?.search) p = p.set('search', params.search);
    return this.http.get<Box[]>(this.api, { params: p });
  }

  getOne(id: string) { return this.http.get<Box>(`${this.api}/${id}`); }
  create(data: Partial<Box>) { return this.http.post<Box>(this.api, data); }
  update(id: string, data: Partial<Box>) { return this.http.patch<Box>(`${this.api}/${id}`, data); }
  delete(id: string) { return this.http.delete(`${this.api}/${id}`); }
  empty(id: string) { return this.http.post(`${this.api}/${id}/empty`, {}); }
  contents(id: string) { return this.http.get<BoxContents>(`${this.api}/${id}/contents`); }
}

@Injectable({ providedIn: 'root' })
export class ItemService {
  private api = `${environment.apiUrl}/items`;
  constructor(private http: HttpClient) {}

  getAll(params?: { category?: string; search?: string }) {
    let p = new HttpParams();
    if (params?.category) p = p.set('category', params.category);
    if (params?.search) p = p.set('search', params.search);
    return this.http.get<Item[]>(this.api, { params: p });
  }

  getOne(id: string) { return this.http.get<Item>(`${this.api}/${id}`); }
  create(data: Partial<Item>) { return this.http.post<Item>(this.api, data); }
  update(id: string, data: Partial<Item>) { return this.http.patch<Item>(`${this.api}/${id}`, data); }
  delete(id: string) { return this.http.delete(`${this.api}/${id}`); }

  uploadImage(id: string, file: File) {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.api}/${id}/upload-image`, fd);
  }
}

@Injectable({ providedIn: 'root' })
export class PackingService {
  private api = `${environment.apiUrl}/packing`;
  constructor(private http: HttpClient) {}

  canFit(boxId: string, itemId: string, quantity = 1) {
    return this.http.post<PackResult>(`${this.api}/can-fit`, { boxId, itemId, quantity });
  }

  put(boxId: string, itemId: string, quantity = 1) {
    return this.http.post<PackResult>(`${this.api}/put`, { boxId, itemId, quantity });
  }

  remove(boxId: string, itemId: string) {
    return this.http.delete<PackResult>(`${this.api}/remove`, { body: { boxId, itemId } });
  }

  recommend(itemId: string, quantity = 1) {
    return this.http.get<RecommendResult[]>(`${this.api}/recommend/${itemId}`, {
      params: new HttpParams().set('quantity', quantity.toString()),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private api = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}

  overview() { return this.http.get<StatsOverview>(`${this.api}/stats/overview`); }

  searchItems(query: string) {
    return this.http.get<Item[]>(`${this.api}/search/items`, {
      params: new HttpParams().set('query', query),
    });
  }
}
