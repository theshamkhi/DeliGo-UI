export interface Produit {
  id?: string;
  nom: string;
  description: string;
  reference: string;
  prixUnitaire: number;
  stock: number;
  dateCreation?: Date;
  dateModification?: Date;
}
