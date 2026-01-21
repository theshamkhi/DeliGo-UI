import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HistoriqueLivraison } from '../models/historique-livraison.model';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueLivraisonService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/historiques`;

  // Get history for a specific parcel
  getByColisId(colisId: string): Observable<HistoriqueLivraison[]> {
    return this.http.get<HistoriqueLivraison[]>(`${this.apiUrl}/colis/${colisId}`);
  }
}
