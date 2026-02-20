import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { AuthActions } from './auth.actions';
import { UIActions } from '../ui/ui.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Login Effect
   */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error) =>
            of(
              AuthActions.loginFailure({
                error: error.message || 'Échec de la connexion'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Login Success - Persist tokens and navigate
   */
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          // Store tokens in localStorage
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

          // Store user data
          const user = {
            id: response.id,
            username: response.username,
            email: response.email,
            nom: response.nom,
            prenom: response.prenom,
            roleNames: response.roles,
            actif: true
          };
          localStorage.setItem('currentUser', JSON.stringify(user));

          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  /**
   * Load Profile Effect
   */
  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadProfile),
      switchMap(() =>
        this.authService.getProfile().pipe(
          map((user) => AuthActions.loadProfileSuccess({ user })),
          catchError((error) =>
            of(
              AuthActions.loadProfileFailure({
                error: error.message || 'Échec du chargement du profil'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Restore Session Effect - on app init
   */
  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.restoreSession),
      switchMap(() => {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('currentUser');

        if (!token || !userJson) {
          return of(AuthActions.restoreSessionFailure());
        }

        try {
          const user = JSON.parse(userJson);

          // Validate user has roles
          if (!user.roleNames || user.roleNames.length === 0) {
            // Fetch fresh profile
            return this.authService.getProfile().pipe(
              map((freshUser) => AuthActions.restoreSessionSuccess({ user: freshUser })),
              catchError(() => of(AuthActions.restoreSessionFailure()))
            );
          }

          return of(AuthActions.restoreSessionSuccess({ user }));
        } catch (error) {
          return of(AuthActions.restoreSessionFailure());
        }
      })
    )
  );

  /**
   * Token Refresh Effect
   */
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        this.authService.refreshToken().pipe(
          map((response) => AuthActions.refreshTokenSuccess({ response })),
          catchError((error) =>
            of(
              AuthActions.refreshTokenFailure({
                error: error.message || 'Échec du rafraîchissement du token'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Logout Effect
   */
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
      }),
      map(() => AuthActions.logoutComplete())
    )
  );

  /**
   * Logout Complete - Navigate to login
   */
  logoutComplete$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutComplete),
        tap(() => {
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );

  /**
   * OAuth Callback Effect
   */
  oauthCallback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.oAuthCallback),
      tap(({ accessToken, refreshToken }) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }),
      switchMap(() =>
        this.authService.getProfile().pipe(
          map((user) => AuthActions.loadProfileSuccess({ user })),
          catchError((error) =>
            of(
              AuthActions.loadProfileFailure({
                error: error.message || 'Échec du chargement du profil OAuth'
              })
            )
          )
        )
      )
    )
  );
}
