import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Colis } from '../models/colis.model';
import { PageResponse } from '../models/pagination.model';
import { PageRequest } from '../models/pagination.model';

/**
 *  Request model for updating colis status
 */
export interface UpdateStatutRequest {
  statut: string;
  commentaire?: string;
  modifiePar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/colis`;

  /**
   * Get all colis with pagination (role-based filtering on backend)
   */
  getAll(pageRequest: PageRequest): Observable<PageResponse<Colis>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    if (pageRequest.sort) {
      params = params.set('sort', pageRequest.sort);
    }

    return this.http.get<PageResponse<Colis>>(this.apiUrl, { params });
  }

  /**
   * Get colis by ID
   */
  getById(id: string): Observable<Colis> {
    return this.http.get<Colis>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search colis
   */
  search(keyword: string, pageRequest: PageRequest): Observable<PageResponse<Colis>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    return this.http.get<PageResponse<Colis>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Create new colis
   */
  create(colis: Colis): Observable<Colis> {
    return this.http.post<Colis>(this.apiUrl, colis);
  }

  /**
   * Update existing colis
   */
  update(id: string, colis: Colis): Observable<Colis> {
    return this.http.put<Colis>(`${this.apiUrl}/${id}`, colis);
  }

  /**
   *  Update colis status with proper request body
   */
  updateStatus(id: string, statut: string, commentaire?: string): Observable<Colis> {
    const request: UpdateStatutRequest = {
      statut: statut,
      commentaire: commentaire
    };

    console.log('Updating status:', { id, request }); // ✅ DEBUG

    return this.http.patch<Colis>(`${this.apiUrl}/${id}/statut`, request);
  }

  /**
   * Delete colis
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get colis statistics
   */
  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  assignLivreur(colisId: string, livreurId: string): Observable<Colis> {
    return this.http.patch<Colis>(`${this.apiUrl}/${colisId}`, { livreurId });
  }
}
