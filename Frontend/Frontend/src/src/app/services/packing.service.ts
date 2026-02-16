import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PackingService {
  constructor(private http: HttpClient) {}

  canFit(payload: { boxId: string; itemId: string; quantity: number }) {
    return this.http.post<any>(`${environment.apiBaseUrl}/packing/can-fit`, payload);
  }

  put(payload: { boxId: string; itemId: string; quantity: number }) {
    return this.http.post<any>(`${environment.apiBaseUrl}/packing/put`, payload);
  }

  recommend(itemId: string, quantity: number) {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/packing/recommend/${itemId}?quantity=${quantity}`);
  }
}
