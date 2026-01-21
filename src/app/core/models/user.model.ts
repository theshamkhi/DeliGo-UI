export interface User {
  id?: string;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  actif?: boolean;

  roleNames?: string[];

  permissions?: string[];

  clientExpediteurId?: string;
  livreurId?: string;

  dateCreation?: Date;
  dateModification?: Date;
}

/**
 *   Type guard to check if object is a valid User
 */
export function isValidUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.nom === 'string' &&
    typeof obj.prenom === 'string' &&
    Array.isArray(obj.roleNames) &&
    obj.roleNames.length > 0
  );
}

export function getUserPrimaryRole(user: User): string | null {
  if (!user.roleNames || user.roleNames.length === 0) {
    return null;
  }

  if (user.roleNames.includes('ROLE_MANAGER')) {
    return 'ROLE_MANAGER';
  }
  if (user.roleNames.includes('ROLE_LIVREUR')) {
    return 'ROLE_LIVREUR';
  }
  if (user.roleNames.includes('ROLE_CLIENT')) {
    return 'ROLE_CLIENT';
  }

  return user.roleNames[0];
}
