import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(private http: HttpClient) {}

  searchItems(query: string) {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>(`${environment.apiBaseUrl}/search/items`, { params });
  }
}
