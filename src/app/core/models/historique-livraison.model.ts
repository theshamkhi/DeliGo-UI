import { StatutColis } from './colis.model';

export interface HistoriqueLivraison {
  id?: string;
  colisId: string;
  ancienStatut?: StatutColis;
  nouveauStatut: StatutColis;
  commentaire?: string;
  dateChangement: Date;
  modifiePar?: string;
}
