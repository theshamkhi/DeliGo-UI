import {Client} from './client.model';
import {Destinataire} from './destinataire.model';
import {Livreur} from './livreur.model';


export enum StatutColis {
  CREE = 'CREE',
  COLLECTE = 'COLLECTE',
  EN_STOCK = 'EN_STOCK',
  EN_TRANSIT = 'EN_TRANSIT',
  LIVRE = 'LIVRE',
  ANNULE = 'ANNULE',
  RETOURNE = 'RETOURNE'
}

export enum PrioriteColis {
  BASSE = 'BASSE',
  NORMALE = 'NORMALE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE'
}

export interface Colis {
  id?: string;
  description: string;
  poids: number;
  priorite: PrioriteColis;
  statut?: StatutColis;
  clientExpediteurId: string;
  clientExpediteur?: Client;
  destinataireId: string;
  destinataire?: Destinataire;
  livreurId?: string;
  livreur?: Livreur;
  villeDestination: string;
  dateLimiteLivraison?: Date;
  dateCreation?: Date;
  dateModification?: Date;
  dateLivraison?: Date;
  commentaire?: string;
}
