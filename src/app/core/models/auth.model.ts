import {User} from './user.model';

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
  token: string;
  refreshToken: string;
  user: User;
}
