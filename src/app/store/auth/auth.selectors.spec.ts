import { selectIsAuthenticated, selectUserRoles, selectIsManager } from './auth.selectors';
import { AuthState } from './auth.reducer';

describe('Auth Selectors', () => {
  const mockAuthState: AuthState = {
    user: {
      id: '1',
      username: 'manager',
      email: 'manager@test.com',
      nom: 'Manager',
      prenom: 'Test',
      roleNames: ['ROLE_MANAGER'],
      actif: true
    },
    isAuthenticated: true,
    loading: false,
    error: null,
    accessToken: 'token',
    refreshToken: 'refresh'
  };

  it('should select isAuthenticated', () => {
    const result = selectIsAuthenticated.projector(mockAuthState);
    expect(result).toBe(true);
  });

  it('should select user roles', () => {
    const result = selectUserRoles.projector(mockAuthState.user);
    expect(result).toEqual(['ROLE_MANAGER']);
  });

  it('should select isManager', () => {
    const result = selectIsManager.projector(['ROLE_MANAGER']);
    expect(result).toBe(true);
  });

  it('should return false for non-manager', () => {
    const result = selectIsManager.projector(['ROLE_CLIENT']);
    expect(result).toBe(false);
  });
});
