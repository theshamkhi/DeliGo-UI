import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive state management
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  // BehaviorSubject for Observable compatibility
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.saveTokens(response.accessToken, response.refreshToken);

          if (response.roles && response.roles.length > 0) {
            const currentUserData = this.currentUser();
            if (currentUserData) {
              currentUserData.roleNames = response.roles;
              this.currentUser.set(currentUserData);
              this.saveUserToStorage(currentUserData);
            }
          }
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`)
      .pipe(
        tap(user => {
          console.log('Profile loaded:', user);
          this.currentUser.set(user);
          this.currentUserSubject.next(user);
          this.saveUserToStorage(user);
        }),
        catchError(error => {
          console.error('Profile loading error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.clearAuthData(),
      error: () => this.clearAuthData()
    });
  }

  /**
   * Handle OAuth2 tokens from redirect
   * Called after successful OAuth2 authentication
   */
  handleOAuthTokens(accessToken: string, refreshToken: string): void {
    this.saveTokens(accessToken, refreshToken);
    this.isAuthenticated.set(true);
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    console.log('Auth success response:', response);

    this.saveTokens(response.accessToken, response.refreshToken);

    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      nom: response.nom,
      prenom: response.prenom,
      actif: true,
      roleNames: response.roles || [],
      clientExpediteurId: (response as any).clientExpediteurId,
      livreurId: (response as any).livreurId
    };

    console.log('User object created:', user);
    console.log('User roles:', user.roleNames);

    this.currentUser.set(user);
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    this.saveUserToStorage(user);
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokens(token: string, refreshToken: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Save user to localStorage
   */
  private saveUserToStorage(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('User saved to localStorage:', user); // ✅ DEBUG
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem('currentUser');

    console.log('Loading from storage - Token exists:', !!token);
    console.log('Loading from storage - User JSON:', userJson);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;

        if (!user.roleNames || user.roleNames.length === 0) {
          console.error('User loaded but has no roles! Fetching profile...');

          this.getProfile().subscribe({
            next: (freshUser) => {
              console.log('Fresh profile loaded with roles:', freshUser.roleNames);
            },
            error: (error) => {
              console.error('Failed to load profile, clearing auth data');
              this.clearAuthData();
            }
          });
          return;
        }

        console.log('User loaded from storage:', user);
        console.log('User roles from storage:', user.roleNames);

        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.clearAuthData();
      }
    } else if (token && !userJson) {
      console.log('Token exists but no user data, fetching profile...');
      this.getProfile().subscribe({
        error: () => this.clearAuthData()
      });
    }
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    const hasRole = user?.roleNames?.includes(role) || false;

    if (!hasRole && user) {
      console.log(`Role check failed - Looking for: ${role}, User has:`, user.roleNames);
    }

    return hasRole;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Get user roles
   */
  getUserRoles(): string[] {
    const roles = this.currentUser()?.roleNames || [];
    console.log('Getting user roles:', roles); // ✅ DEBUG
    return roles;
  }
}
