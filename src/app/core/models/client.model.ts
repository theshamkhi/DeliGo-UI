export interface Client {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateCreation?: Date;
  dateModification?: Date;
}
