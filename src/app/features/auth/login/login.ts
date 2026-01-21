import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { OAuthService } from '../../../core/services/oauth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card-wrapper">
        <mat-card class="login-card">
          <mat-card-header>
            <div class="logo-section">
              <div class="logo">🚚</div>
              <h1>DeliGo</h1>
              <p class="subtitle">Système de Gestion de Livraison</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <h2>Connexion</h2>

              <div *ngIf="errorMessage()" class="error-message">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>

              <!-- OAuth2 Google Login Button -->
              <button mat-raised-button
                      type="button"
                      class="google-login-button"
                      (click)="loginWithGoogle()">
                <img src="assets/google-icon.svg" alt="Google" class="google-icon" />
                <span>Continuer avec Google</span>
              </button>

              <div class="divider-container">
                <mat-divider></mat-divider>
                <span class="divider-text">OU</span>
                <mat-divider></mat-divider>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom d'utilisateur</mat-label>
                <input matInput
                       formControlName="username"
                       placeholder="Entrez votre nom d'utilisateur"
                       autocomplete="username">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  Le nom d'utilisateur est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mot de passe</mat-label>
                <input matInput
                       [type]="hidePassword() ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="Entrez votre mot de passe"
                       autocomplete="current-password">
                <button mat-icon-button
                        matSuffix
                        type="button"
                        (click)="togglePasswordVisibility()"
                        [attr.aria-label]="'Hide password'">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Le mot de passe est requis
                </mat-error>
              </mat-form-field>

              <div class="form-options">
                <mat-checkbox formControlName="rememberMe" color="primary">
                  Se souvenir de moi
                </mat-checkbox>
                <a routerLink="/forgot-password" class="forgot-link">
                  Mot de passe oublié?
                </a>
              </div>

              <button mat-raised-button
                      color="primary"
                      type="submit"
                      class="login-button"
                      [disabled]="loginForm.invalid || loading()">
                <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
                <span *ngIf="!loading()">Se connecter</span>
              </button>

              <div class="register-link">
                Vous n'avez pas de compte?
                <a routerLink="/register">S'inscrire</a>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="info-section">
          <h3>Bienvenue sur DeliGo</h3>
          <p>Gérez efficacement vos livraisons avec notre plateforme complète.</p>

          <div class="features">
            <div class="feature">
              <mat-icon>inventory_2</mat-icon>
              <span>Suivi des colis en temps réel</span>
            </div>
            <div class="feature">
              <mat-icon>local_shipping</mat-icon>
              <span>Gestion des livreurs</span>
            </div>
            <div class="feature">
              <mat-icon>analytics</mat-icon>
              <span>Statistiques détaillées</span>
            </div>
            <div class="feature">
              <mat-icon>map</mat-icon>
              <span>Zones de livraison</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card-wrapper {
      display: grid;
      grid-template-columns: 450px 400px;
      gap: 0;
      max-width: 850px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      overflow: hidden;
    }

    .login-card {
      margin: 0;
      border-radius: 12px 0 0 12px;
      padding: 40px;
    }

    .logo-section {
      text-align: center;
      width: 100%;
      margin-bottom: 20px;
    }

    .logo {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .logo-section h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 600;
      color: #667eea;
    }

    .subtitle {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    form h2 {
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 500;
      color: #333;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      margin-bottom: 20px;
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      border-radius: 4px;
      color: #c62828;
    }

    .error-message mat-icon {
      color: #f44336;
    }

    .google-login-button {
      width: 100%;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: white;
      color: #333;
      border: 1px solid #dadce0;
      margin-bottom: 20px;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .google-login-button:hover {
      background: #f8f9fa;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .google-icon {
      width: 20px;
      height: 20px;
    }

    .divider-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
    }

    .divider-text {
      color: rgba(0, 0, 0, 0.6);
      font-size: 13px;
      white-space: nowrap;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .forgot-link {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-bottom: 16px;
    }

    .login-button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .register-link {
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      margin-left: 4px;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .info-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .info-section h3 {
      margin: 0 0 16px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .info-section p {
      margin: 0 0 32px 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .feature mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .feature span {
      font-size: 15px;
    }

    @media (max-width: 900px) {
      .login-card-wrapper {
        grid-template-columns: 1fr;
        max-width: 450px;
      }

      .login-card {
        border-radius: 12px 12px 0 0;
      }

      .info-section {
        display: none;
      }
    }

    @media (max-width: 500px) {
      .login-card {
        padding: 24px;
      }

      .login-card-wrapper {
        max-width: 100%;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private oauthService = inject(OAuthService);

  loginForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);
  errorMessage = signal<string>('');
  returnUrl: string = '/dashboard';

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Get return URL from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  togglePasswordVisibility() {
    this.hidePassword.update(value => !value);
  }

  loginWithGoogle() {
    // Initiate Google OAuth2 flow
    this.oauthService.loginWithGoogle();
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const credentials: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        // ✅ FIXED: AuthResponse has user data at root level, not in a 'user' property
        console.log('Login successful:', {
          username: response.username,
          email: response.email,
          roles: response.roles
        });
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.message || 'Nom d\'utilisateur ou mot de passe incorrect'
        );
      }
    });
  }
}
