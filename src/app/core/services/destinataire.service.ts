import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Destinataire } from '../models/destinataire.model';
import { PageResponse, PageRequest } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class DestinataireService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/destinataires`;

  getAll(pageRequest: PageRequest): Observable<PageResponse<Destinataire>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    if (pageRequest.sort) {
      params = params.set('sort', pageRequest.sort);
    }

    return this.http.get<PageResponse<Destinataire>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Destinataire> {
    return this.http.get<Destinataire>(`${this.apiUrl}/${id}`);
  }

  search(keyword: string, pageRequest: PageRequest): Observable<PageResponse<Destinataire>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    return this.http.get<PageResponse<Destinataire>>(`${this.apiUrl}/search`, { params });
  }

  create(destinataire: Destinataire): Observable<Destinataire> {
    return this.http.post<Destinataire>(this.apiUrl, destinataire);
  }

  update(id: string, destinataire: Destinataire): Observable<Destinataire> {
    return this.http.put<Destinataire>(`${this.apiUrl}/${id}`, destinataire);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
