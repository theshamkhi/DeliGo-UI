export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  roleNames: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  id: string;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  roles: string[];
  permissions: string[];
}
