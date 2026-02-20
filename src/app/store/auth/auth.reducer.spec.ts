import { authReducer, initialState, AuthState } from './auth.reducer';
import { AuthActions } from './auth.actions';

describe('Auth Reducer', () => {
  it('should return initial state', () => {
    const action = { type: 'Unknown' };
    const state = authReducer(initialState, action as any);
    expect(state).toBe(initialState);
  });

  it('should set loading on login', () => {
    const action = AuthActions.login({
      credentials: { username: 'test', password: 'test' }
    });
    const state = authReducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should set user on login success', () => {
    const response = {
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      nom: 'Test',
      prenom: 'User',
      roles: ['ROLE_CLIENT'],
      accessToken: 'token',
      refreshToken: 'refresh',
      type: 'Bearer',
      permissions: []
    };

    const action = AuthActions.loginSuccess({ response });
    const state = authReducer(initialState, action);

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.username).toBe('testuser');
    expect(state.loading).toBe(false);
  });

  it('should clear state on logout', () => {
    const loggedInState = {
      ...initialState,
      isAuthenticated: true,
      user: { id: '1', username: 'test' } as any
    };

    const action = AuthActions.logoutComplete();
    const state = authReducer(loggedInState, action);

    expect(state).toEqual(initialState);
  });
});
