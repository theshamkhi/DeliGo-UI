import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Colis, StatutColis } from '../models/colis.model';
import { PageResponse, PageRequest } from '../models/pagination.model';
import { ColisStatistics } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class ColisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/colis`;

  getAll(pageRequest: PageRequest): Observable<PageResponse<Colis>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    if (pageRequest.sort) {
      params = params.set('sort', pageRequest.sort);
    }

    return this.http.get<PageResponse<Colis>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Colis> {
    return this.http.get<Colis>(`${this.apiUrl}/${id}`);
  }

  search(keyword: string, pageRequest: PageRequest): Observable<PageResponse<Colis>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    return this.http.get<PageResponse<Colis>>(`${this.apiUrl}/search`, { params });
  }

  create(colis: Colis): Observable<Colis> {
    return this.http.post<Colis>(this.apiUrl, colis);
  }

  update(id: string, colis: Colis): Observable<Colis> {
    return this.http.put<Colis>(`${this.apiUrl}/${id}`, colis);
  }

  updateStatus(id: string, statut: string, commentaire?: string): Observable<Colis> {
    return this.http.patch<Colis>(`${this.apiUrl}/${id}/statut`, {
      statut,
      commentaire
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatistics(): Observable<ColisStatistics> {
    return this.http.get<ColisStatistics>(`${this.apiUrl}/statistiques`);
  }
}
