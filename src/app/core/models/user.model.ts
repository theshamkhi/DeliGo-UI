export interface User {
  id?: string;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  roleNames: string[];
  actif?: boolean;
  dateCreation?: Date;
}
