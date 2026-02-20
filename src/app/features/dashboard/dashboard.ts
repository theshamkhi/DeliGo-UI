import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from '../../store';
import { ColisActions } from '../../store/colis/colis.actions';
import {
  selectColisStatistics,
  selectColisLoading
} from '../../store/colis/colis.selectors';
import {
  selectIsManager,
  selectIsLivreur,
  selectIsClient,
  selectUserFullName
} from '../../store/auth/auth.selectors';

interface DashboardStats {
  total: number;
  enAttente: number;
  enTransit: number;
  livres: number;
  annules: number;
  retournes: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Tableau de Bord DeliGo</h1>
        <p class="subtitle">{{ getWelcomeMessage() | async }}</p>
      </div>

      <!-- Statistics Cards (Only for Manager) -->
      <div *ngIf="(isManager$ | async) && (loading$ | async)" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="(isManager$ | async) && !(loading$ | async)" class="stats-grid">
        <mat-card class="stat-card total">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ (statistics$ | async)?.total || 0 }}</h3>
              <p>Total Colis</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card pending">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ (statistics$ | async)?.enAttente || 0 }}</h3>
              <p>En Attente</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card in-transit">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>local_shipping</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ (statistics$ | async)?.enTransit || 0 }}</h3>
              <p>En Transit</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card delivered">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ (statistics$ | async)?.livres || 0 }}</h3>
              <p>Livrés</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card cancelled">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>cancel</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ (statistics$ | async)?.annules || 0 }}</h3>
              <p>Annulés</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card returned">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>keyboard_return</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ (statistics$ | async)?.retournes || 0 }}</h3>
              <p>Retournés</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions - Role Based -->
      <div class="quick-actions">
        <h2>Actions Rapides</h2>
        <div class="actions-grid">
          <!-- Client Actions -->
          <mat-card *ngIf="isClient$ | async" class="action-card" routerLink="/colis/new">
            <mat-card-content>
              <mat-icon>add_box</mat-icon>
              <h3>Nouvelle Demande</h3>
              <p>Créer une demande de livraison</p>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="isClient$ | async" class="action-card" routerLink="/colis">
            <mat-card-content>
              <mat-icon>send</mat-icon>
              <h3>Mes Envois</h3>
              <p>Voir mes colis envoyés</p>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="isClient$ | async" class="action-card" routerLink="/destinataires">
            <mat-card-content>
              <mat-icon>contacts</mat-icon>
              <h3>Mes Destinataires</h3>
              <p>Gérer mes destinataires</p>
            </mat-card-content>
          </mat-card>

          <!-- Livreur Actions -->
          <mat-card *ngIf="isLivreur$ | async" class="action-card" routerLink="/colis">
            <mat-card-content>
              <mat-icon>local_shipping</mat-icon>
              <h3>Ma Tournée</h3>
              <p>Colis assignés à moi</p>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="isLivreur$ | async" class="action-card" routerLink="/colis/tracking">
            <mat-card-content>
              <mat-icon>track_changes</mat-icon>
              <h3>Suivi</h3>
              <p>Suivre un colis</p>
            </mat-card-content>
          </mat-card>

          <!-- Manager Actions -->
          <mat-card *ngIf="isManager$ | async" class="action-card" routerLink="/colis/new">
            <mat-card-content>
              <mat-icon>add_box</mat-icon>
              <h3>Nouveau Colis</h3>
              <p>Créer un nouveau colis</p>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="isManager$ | async" class="action-card" routerLink="/clients/new">
            <mat-card-content>
              <mat-icon>person_add</mat-icon>
              <h3>Nouveau Client</h3>
              <p>Ajouter un client</p>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="isManager$ | async" class="action-card" routerLink="/destinataires/new">
            <mat-card-content>
              <mat-icon>contact_mail</mat-icon>
              <h3>Nouveau Destinataire</h3>
              <p>Ajouter un destinataire</p>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="isManager$ | async" class="action-card" routerLink="/livreurs/new">
            <mat-card-content>
              <mat-icon>delivery_dining</mat-icon>
              <h3>Nouveau Livreur</h3>
              <p>Ajouter un livreur</p>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="isManager$ | async" class="action-card" routerLink="/colis">
            <mat-card-content>
              <mat-icon>list</mat-icon>
              <h3>Tous les Colis</h3>
              <p>Voir tous les colis</p>
            </mat-card-content>
          </mat-card>

          <!-- Common Action -->
          <mat-card class="action-card" routerLink="/colis/tracking">
            <mat-card-content>
              <mat-icon>track_changes</mat-icon>
              <h3>Suivi Colis</h3>
              <p>Suivre un colis</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Management Links (Manager Only) -->
      <div *ngIf="isManager$ | async" class="management-links">
        <h2>Gestion</h2>
        <div class="links-grid">
          <mat-card class="link-card" routerLink="/clients">
            <mat-card-content>
              <mat-icon>people</mat-icon>
              <h3>Clients</h3>
            </mat-card-content>
          </mat-card>

          <mat-card class="link-card" routerLink="/destinataires">
            <mat-card-content>
              <mat-icon>contacts</mat-icon>
              <h3>Destinataires</h3>
            </mat-card-content>
          </mat-card>

          <mat-card class="link-card" routerLink="/livreurs">
            <mat-card-content>
              <mat-icon>local_shipping</mat-icon>
              <h3>Livreurs</h3>
            </mat-card-content>
          </mat-card>

          <mat-card class="link-card" routerLink="/produits">
            <mat-card-content>
              <mat-icon>category</mat-icon>
              <h3>Produits</h3>
            </mat-card-content>
          </mat-card>

          <mat-card class="link-card" routerLink="/zones">
            <mat-card-content>
              <mat-icon>map</mat-icon>
              <h3>Zones</h3>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 500;
      color: #1976d2;
    }

    .subtitle {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      cursor: default;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 24px !important;
    }

    .stat-icon {
      margin-right: 16px;
    }

    .stat-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 32px;
      font-weight: 600;
    }

    .stat-info p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .stat-card.total { border-left: 4px solid #2196F3; }
    .stat-card.total .stat-icon mat-icon { color: #2196F3; }

    .stat-card.pending { border-left: 4px solid #FF9800; }
    .stat-card.pending .stat-icon mat-icon { color: #FF9800; }

    .stat-card.in-transit { border-left: 4px solid #9C27B0; }
    .stat-card.in-transit .stat-icon mat-icon { color: #9C27B0; }

    .stat-card.delivered { border-left: 4px solid #4CAF50; }
    .stat-card.delivered .stat-icon mat-icon { color: #4CAF50; }

    .stat-card.cancelled { border-left: 4px solid #F44336; }
    .stat-card.cancelled .stat-icon mat-icon { color: #F44336; }

    .stat-card.returned { border-left: 4px solid #607D8B; }
    .stat-card.returned .stat-icon mat-icon { color: #607D8B; }

    .quick-actions, .management-links {
      margin-bottom: 40px;
    }

    .quick-actions h2, .management-links h2 {
      margin: 0 0 20px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .action-card, .link-card {
      cursor: pointer;
      transition: all 0.3s;
    }

    .action-card:hover, .link-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }

    .action-card mat-card-content, .link-card mat-card-content {
      text-align: center;
      padding: 24px !important;
    }

    .action-card mat-icon, .link-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 12px;
    }

    .action-card h3, .link-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .action-card p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid,
      .actions-grid,
      .links-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private store = inject(Store<AppState>);

  // Selectors
  statistics$ = this.store.select(selectColisStatistics);
  loading$ = this.store.select(selectColisLoading);
  isManager$ = this.store.select(selectIsManager);
  isLivreur$ = this.store.select(selectIsLivreur);
  isClient$ = this.store.select(selectIsClient);

  ngOnInit() {
    // Load colis data for statistics (only if manager)
    this.isManager$.subscribe(isManager => {
      if (isManager) {
        this.store.dispatch(
          ColisActions.loadColis({
            pageRequest: { page: 0, size: 1000, sort: 'dateCreation,desc' }
          })
        );
      }
    });
  }

  getWelcomeMessage(): Observable<string> {
    return this.store.select(selectUserFullName).pipe(
      map(fullName => {
        const name = fullName || 'Utilisateur';

        // Determine message based on role
        return this.isManager$.pipe(
          map(isManager => {
            if (isManager) {
              return `Bienvenue ${name} - Vue d'ensemble de votre activité de livraison`;
            }
            return '';
          })
        );
      }),
      // Flatten the nested observable
      switchMap(obs => obs)
    );
  }
}

import { switchMap } from 'rxjs/operators';
