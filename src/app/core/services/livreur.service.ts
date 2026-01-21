import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Livreur } from '../models/livreur.model';
import { PageResponse, PageRequest } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class LivreurService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/livreurs`;

  getAll(pageRequest: PageRequest): Observable<PageResponse<Livreur>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    if (pageRequest.sort) {
      params = params.set('sort', pageRequest.sort);
    }

    return this.http.get<PageResponse<Livreur>>(this.apiUrl, { params });
  }

  getActive(): Observable<Livreur[]> {
    return this.http.get<Livreur[]>(`${this.apiUrl}/actifs`);
  }

  getById(id: string): Observable<Livreur> {
    return this.http.get<Livreur>(`${this.apiUrl}/${id}`);
  }

  search(keyword: string, pageRequest: PageRequest): Observable<PageResponse<Livreur>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    return this.http.get<PageResponse<Livreur>>(`${this.apiUrl}/search`, { params });
  }

  create(livreur: Livreur): Observable<Livreur> {
    return this.http.post<Livreur>(this.apiUrl, livreur);
  }

  update(id: string, livreur: Livreur): Observable<Livreur> {
    return this.http.put<Livreur>(`${this.apiUrl}/${id}`, livreur);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
