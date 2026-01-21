import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private readonly GOOGLE_AUTH_URL = `${environment.apiUrl}/oauth2/authorize/google`;
  private readonly REDIRECT_URI = environment.oauth2RedirectUri || 'http://localhost:4200/oauth2/redirect';

  /**
   * Initiate Google OAuth2 login
   */
  loginWithGoogle(): void {
    // Construct the OAuth2 authorization URL
    const authUrl = `${this.GOOGLE_AUTH_URL}?redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}`;

    // Redirect to the OAuth2 provider
    window.location.href = authUrl;
  }

  /**
   * Extract tokens from URL parameters
   */
  extractTokensFromUrl(url: string): { accessToken: string; refreshToken: string } | null {
    try {
      const urlParams = new URLSearchParams(new URL(url).search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');

      if (accessToken && refreshToken) {
        return {
          accessToken,
          refreshToken
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting tokens from URL:', error);
      return null;
    }
  }

  /**
   * Check if current URL contains OAuth2 tokens
   */
  isOAuthCallback(): boolean {
    const url = window.location.href;
    return url.includes('access_token') && url.includes('refresh_token');
  }
}
