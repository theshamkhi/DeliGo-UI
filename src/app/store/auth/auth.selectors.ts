import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectAccessToken = createSelector(
  selectAuthState,
  (state) => state.accessToken
);

export const selectUserRoles = createSelector(
  selectCurrentUser,
  (user) => user?.roleNames || []
);

export const selectHasRole = (role: string) => createSelector(
  selectUserRoles,
  (roles) => roles.includes(role)
);

export const selectHasAnyRole = (requiredRoles: string[]) => createSelector(
  selectUserRoles,
  (roles) => requiredRoles.some(role => roles.includes(role))
);

export const selectIsManager = createSelector(
  selectUserRoles,
  (roles) => roles.includes('ROLE_MANAGER')
);

export const selectIsLivreur = createSelector(
  selectUserRoles,
  (roles) => roles.includes('ROLE_LIVREUR')
);

export const selectIsClient = createSelector(
  selectUserRoles,
  (roles) => roles.includes('ROLE_CLIENT')
);

export const selectUserFullName = createSelector(
  selectCurrentUser,
  (user) => user ? `${user.prenom} ${user.nom}` : ''
);
