import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  accessToken: null,
  refreshToken: null
};

export const authReducer = createReducer(
  initialState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: {
      id: response.id,
      username: response.username,
      email: response.email,
      nom: response.nom,
      prenom: response.prenom,
      roleNames: response.roles,
      actif: true
    },
    isAuthenticated: true,
    loading: false,
    error: null,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false
  })),

  // Load Profile
  on(AuthActions.loadProfile, (state) => ({
    ...state,
    loading: true
  })),
  on(AuthActions.loadProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.loadProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Restore Session
  on(AuthActions.restoreSession, (state) => ({
    ...state,
    loading: true
  })),
  on(AuthActions.restoreSessionSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false
  })),
  on(AuthActions.restoreSessionFailure, (state) => initialState),

  // Token Refresh
  on(AuthActions.refreshTokenSuccess, (state, { response }) => ({
    ...state,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: state.user ? {
      ...state.user,
      roleNames: response.roles || state.user.roleNames
    } : null
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true
  })),
  on(AuthActions.logoutComplete, () => initialState)
);
