import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from './core/services/auth.service';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    LoadingSpinnerComponent
  ],
  template: `
    @if (authService.isAuthenticated()) {
      <div class="app-container">
        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav #sidenav mode="side" opened class="sidenav">
            <div class="logo-container">
              <h2>🚚 DeliGo</h2>
              <p class="user-role">{{ getUserRoleLabel() }}</p>
            </div>

            <mat-nav-list>
              <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>

              <mat-divider></mat-divider>

              <div class="section-title">Gestion</div>

              <a mat-list-item routerLink="/colis" routerLinkActive="active">
                <mat-icon matListItemIcon>inventory_2</mat-icon>
                <span matListItemTitle>
                  {{ getColisLabel() }}
                </span>
              </a>

              @if (authService.hasRole('ROLE_MANAGER')) {
                <a mat-list-item routerLink="/clients" routerLinkActive="active">
                  <mat-icon matListItemIcon>people</mat-icon>
                  <span matListItemTitle>Clients</span>
                </a>
              }

              <a mat-list-item routerLink="/destinataires" routerLinkActive="active">
                <mat-icon matListItemIcon>contacts</mat-icon>
                <span matListItemTitle>
                  {{ getDestinataireLabel() }}
                </span>
              </a>

              @if (authService.hasRole('ROLE_MANAGER')) {
                <a mat-list-item routerLink="/livreurs" routerLinkActive="active">
                  <mat-icon matListItemIcon>local_shipping</mat-icon>
                  <span matListItemTitle>Livreurs</span>
                </a>
              }

              <mat-divider></mat-divider>

              <div class="section-title">Catalogue</div>

              <a mat-list-item routerLink="/produits" routerLinkActive="active">
                <mat-icon matListItemIcon>category</mat-icon>
                <span matListItemTitle>Produits</span>
              </a>

              @if (authService.hasRole('ROLE_MANAGER')) {
                <a mat-list-item routerLink="/zones" routerLinkActive="active">
                  <mat-icon matListItemIcon>map</mat-icon>
                  <span matListItemTitle>Zones</span>
                </a>
              }

              <mat-divider></mat-divider>

              <a mat-list-item routerLink="/colis/tracking" routerLinkActive="active">
                <mat-icon matListItemIcon>track_changes</mat-icon>
                <span matListItemTitle>Suivi Colis</span>
              </a>
            </mat-nav-list>
          </mat-sidenav>

          <mat-sidenav-content>
            <mat-toolbar color="primary" class="toolbar">
              <button mat-icon-button (click)="sidenav.toggle()">
                <mat-icon>menu</mat-icon>
              </button>
              <span class="toolbar-title">Système de Gestion de Livraison</span>
              <span class="spacer"></span>

              <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
                <mat-icon matBadge="3" matBadgeColor="warn">notifications</mat-icon>
              </button>
              <mat-menu #notificationMenu="matMenu">
                <div class="notification-header">
                  <span>Notifications</span>
                </div>
                <button mat-menu-item>
                  <mat-icon>local_shipping</mat-icon>
                  <span>Nouveau colis assigné</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>check_circle</mat-icon>
                  <span>Livraison confirmée</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>warning</mat-icon>
                  <span>Retard de livraison</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item>
                  <span>Voir toutes les notifications</span>
                </button>
              </mat-menu>

              <button mat-icon-button [matMenuTriggerFor]="userMenu">
                <mat-icon>account_circle</mat-icon>
              </button>
              <mat-menu #userMenu="matMenu">
                <div class="user-info">
                  <div class="user-avatar">
                    <mat-icon>account_circle</mat-icon>
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ getUserFullName() }}</div>
                    <div class="user-email">{{ authService.currentUser()?.email }}</div>
                    <div class="user-roles" style="font-size: 11px; color: rgba(0,0,0,0.5); margin-top: 4px;">
                      Rôles: {{ getUserRoles() }}
                    </div>
                  </div>
                </div>
                <mat-divider></mat-divider>
                <button mat-menu-item routerLink="/profile">
                  <mat-icon>person</mat-icon>
                  <span>Mon Profil</span>
                </button>
                <button mat-menu-item routerLink="/settings">
                  <mat-icon>settings</mat-icon>
                  <span>Paramètres</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  <span>Déconnexion</span>
                </button>
              </mat-menu>
            </mat-toolbar>

            <div class="content">
              <router-outlet></router-outlet>
            </div>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>
    }

    @if (!authService.isAuthenticated()) {
      <div>
        <router-outlet></router-outlet>
      </div>
    }

    <app-loading-spinner></app-loading-spinner>
  `,
  styles: [`
    .app-container {
      height: 100vh;
    }

    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background-color: #fafafa;
      padding: 0;
    }

    .logo-container {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }

    .logo-container h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .user-role {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-title {
      padding: 16px 16px 8px 16px;
      font-size: 12px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.54);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    mat-nav-list {
      padding-top: 8px;
    }

    mat-nav-list a {
      margin: 4px 8px;
      border-radius: 8px;
      transition: all 0.3s;
    }

    mat-nav-list a:hover {
      background-color: rgba(103, 126, 234, 0.08);
    }

    mat-nav-list a.active {
      background-color: rgba(103, 126, 234, 0.12);
      color: #667eea;
    }

    mat-nav-list a.active mat-icon {
      color: #667eea;
    }

    mat-divider {
      margin: 12px 0;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-title {
      font-size: 18px;
      font-weight: 500;
      margin-left: 16px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }

    .user-info {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
      min-width: 280px;
    }

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .user-avatar mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 500;
      font-size: 16px;
      color: #333;
    }

    .user-email {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 2px;
    }

    .notification-header {
      padding: 12px 16px;
      font-weight: 500;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 100%;
      }

      .toolbar-title {
        font-size: 16px;
      }
    }
  `]
})
export class App implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      const user = this.authService.currentUser();

      console.log('Auth state changed:', {
        isAuthenticated: isAuth,
        user: user,
        roles: user?.roleNames
      });
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.currentUser();

      // Check if user data exists and has roles
      if (!currentUser || !currentUser.roleNames || currentUser.roleNames.length === 0) {
        console.log('User logged in but no role data, fetching profile...');
        this.authService.getProfile().subscribe({
          next: (user) => {
            console.log('Profile loaded successfully:', user);
          },
          error: (error) => {
            console.error('Error loading profile:', error);
          }
        });
      } else {
        console.log('User already loaded with roles:', currentUser.roleNames);
      }
    }
  }

  getUserFullName(): string {
    const user = this.authService.currentUser();
    if (user) {
      return `${user.prenom} ${user.nom}`;
    }
    return 'Utilisateur';
  }

  getUserRoleLabel(): string {
    const roles = this.authService.getUserRoles();
    console.log('Getting role label for:', roles);

    if (roles.includes('ROLE_MANAGER')) {
      return 'Manager';
    } else if (roles.includes('ROLE_LIVREUR')) {
      return 'Livreur';
    } else if (roles.includes('ROLE_CLIENT')) {
      return 'Client';
    }
    return 'Utilisateur';
  }

  getUserRoles(): string {
    return this.authService.getUserRoles().join(', ');
  }

  getColisLabel(): string {
    if (this.authService.hasRole('ROLE_MANAGER')) {
      return 'Tous les Colis';
    } else if (this.authService.hasRole('ROLE_LIVREUR')) {
      return 'Mes Livraisons';
    } else if (this.authService.hasRole('ROLE_CLIENT')) {
      return 'Mes Colis';
    }
    return 'Colis';
  }

  getDestinataireLabel(): string {
    if (this.authService.hasRole('ROLE_MANAGER')) {
      return 'Destinataires';
    } else if (this.authService.hasRole('ROLE_CLIENT')) {
      return 'Mes Destinataires';
    }
    return 'Destinataires';
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
      this.authService.logout();
    }
  }
}
