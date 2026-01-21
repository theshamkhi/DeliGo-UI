import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Zone } from '../models/zone.model';
import { PageResponse, PageRequest } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/zones`;

  getAll(pageRequest: PageRequest): Observable<PageResponse<Zone>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    if (pageRequest.sort) {
      params = params.set('sort', pageRequest.sort);
    }

    return this.http.get<PageResponse<Zone>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/${id}`);
  }

  search(keyword: string, pageRequest: PageRequest): Observable<PageResponse<Zone>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    return this.http.get<PageResponse<Zone>>(`${this.apiUrl}/search`, { params });
  }

  create(zone: Zone): Observable<Zone> {
    return this.http.post<Zone>(this.apiUrl, zone);
  }

  update(id: string, zone: Zone): Observable<Zone> {
    return this.http.put<Zone>(`${this.apiUrl}/${id}`, zone);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
