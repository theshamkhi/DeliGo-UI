import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import { LoginRequest, AuthResponse } from '../../core/models/auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login
    'Login': props<{ credentials: LoginRequest }>(),
    'Login Success': props<{ response: AuthResponse }>(),
    'Login Failure': props<{ error: string }>(),

    // Logout
    'Logout': emptyProps(),
    'Logout Complete': emptyProps(),

    // Load Profile
    'Load Profile': emptyProps(),
    'Load Profile Success': props<{ user: User }>(),
    'Load Profile Failure': props<{ error: string }>(),

    // Token Refresh
    'Refresh Token': emptyProps(),
    'Refresh Token Success': props<{ response: AuthResponse }>(),
    'Refresh Token Failure': props<{ error: string }>(),

    // Restore Session
    'Restore Session': emptyProps(),
    'Restore Session Success': props<{ user: User }>(),
    'Restore Session Failure': emptyProps(),

    // OAuth2
    'OAuth Login': props<{ provider: string }>(),
    'OAuth Callback': props<{ accessToken: string; refreshToken: string }>()
  }
});
