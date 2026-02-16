import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface BoxDto {
  id: string;
  code: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  maxWeightKg: number;
  location?: string | null;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class BoxService {
  constructor(private http: HttpClient) {}

  list(params?: { search?: string; status?: string }) {
    let hp = new HttpParams();
    if (params?.search) hp = hp.set('search', params.search);
    if (params?.status) hp = hp.set('status', params.status);
    return this.http.get<BoxDto[]>(`${environment.apiBaseUrl}/boxes`, { params: hp });
  }

  get(id: string) {
    return this.http.get<BoxDto>(`${environment.apiBaseUrl}/boxes/${id}`);
  }

  contents(id: string) {
    return this.http.get<any>(`${environment.apiBaseUrl}/boxes/${id}/contents`);
  }

  create(payload: Partial<BoxDto>) {
    return this.http.post<BoxDto>(`${environment.apiBaseUrl}/boxes`, payload);
  }

  update(id: string, payload: Partial<BoxDto>) {
    return this.http.patch<BoxDto>(`${environment.apiBaseUrl}/boxes/${id}`, payload);
  }

  archive(id: string) {
    return this.http.delete(`${environment.apiBaseUrl}/boxes/${id}`);
  }

  empty(id: string) {
    return this.http.post(`${environment.apiBaseUrl}/boxes/${id}/empty`, {});
  }
}
