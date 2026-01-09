import {Zone} from './zone.model';

export interface Livreur {
  id?: string;
  nom: string;
  prenom: string;
  telephone: string;
  vehicule: string;
  zoneAssigneeId: string;
  zoneAssignee?: Zone;
  actif: boolean;
  dateCreation?: Date;
  dateModification?: Date;
}
