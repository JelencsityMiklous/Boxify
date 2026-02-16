import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ItemDto {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  imagePath?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ItemService {
  constructor(private http: HttpClient) {}

  list(params?: { search?: string; category?: string }) {
    let hp = new HttpParams();
    if (params?.search) hp = hp.set('search', params.search);
    if (params?.category) hp = hp.set('category', params.category);
    return this.http.get<ItemDto[]>(`${environment.apiBaseUrl}/items`, { params: hp });
  }

  create(payload: Partial<ItemDto>) {
    return this.http.post<ItemDto>(`${environment.apiBaseUrl}/items`, payload);
  }

  update(id: string, payload: Partial<ItemDto>) {
    return this.http.patch<ItemDto>(`${environment.apiBaseUrl}/items/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete(`${environment.apiBaseUrl}/items/${id}`);
  }

  uploadImage(id: string, file: File) {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post(`${environment.apiBaseUrl}/items/${id}/upload-image`, fd);
  }
}
