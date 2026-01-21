import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { OAuthService } from '../../../core/services/oauth.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="oauth-redirect-container">
      <div class="oauth-content" *ngIf="!error">
        <mat-spinner diameter="60"></mat-spinner>
        <h2>Connexion en cours...</h2>
        <p>Veuillez patienter pendant que nous finalisons votre connexion</p>
      </div>

      <div class="oauth-content error" *ngIf="error">
        <mat-icon class="error-icon">error</mat-icon>
        <h2>Erreur de connexion</h2>
        <p>{{ errorMessage }}</p>
        <button (click)="goToLogin()" class="retry-button">
          Retour à la connexion
        </button>
      </div>
    </div>
  `,
  styles: [`
    .oauth-redirect-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .oauth-content {
      text-align: center;
      color: white;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      max-width: 400px;
    }

    .oauth-content h2 {
      margin: 24px 0 12px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .oauth-content p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .oauth-content.error {
      background: rgba(244, 67, 54, 0.15);
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ffebee;
    }

    .retry-button {
      margin-top: 24px;
      padding: 12px 32px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .retry-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class OAuth2RedirectComponent implements OnInit {
  private oauthService = inject(OAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);

  error = false;
  errorMessage = '';

  ngOnInit() {
    this.handleOAuthCallback();
  }

  private handleOAuthCallback() {
    const tokens = this.oauthService.extractTokensFromUrl(window.location.href);

    if (tokens) {
      // Store tokens using AuthService
      this.authService.handleOAuthTokens(tokens.accessToken, tokens.refreshToken);

      // Fetch user profile
      this.authService.getProfile().subscribe({
        next: () => {
          // Redirect to dashboard after successful authentication
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error fetching user profile:', error);
          this.showError('Impossible de récupérer les informations de l\'utilisateur');
        }
      });
    } else {
      this.showError('Tokens d\'authentification manquants ou invalides');
    }
  }

  private showError(message: string) {
    this.error = true;
    this.errorMessage = message;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
