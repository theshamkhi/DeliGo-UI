import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { ColisService } from '../../../core/services/colis.service';
import { AuthService } from '../../../core/services/auth.service';
import { Colis, StatutColis } from '../../../core/models/colis.model';

@Component({
  selector: 'app-colis-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatStepperModule
  ],
  template: `
    <div class="detail-container">
      <!-- Access Denied Message -->
      <mat-card *ngIf="accessDenied()">
        <mat-card-content class="access-denied">
          <mat-icon>lock</mat-icon>
          <h2>Accès Refusé</h2>
          <p>Vous n'avez pas l'autorisation de voir ce colis.</p>
          <button mat-raised-button color="primary" routerLink="/colis">
            Retour à la liste
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Main Content -->
      <mat-card *ngIf="!accessDenied()">
        <mat-card-header>
          <div class="header-content">
            <h2>Détail Colis</h2>
            <div class="header-actions">
              <button mat-icon-button
                      (click)="copyTrackingId()"
                      matTooltip="Copier le numéro de suivi">
                <mat-icon>content_copy</mat-icon>
              </button>
              <button mat-icon-button routerLink="/colis">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading() && colis()" class="detail-content">
            <!-- Tracking Number Display -->
            <div class="tracking-number">
              <span class="label">Numéro de suivi:</span>
              <span class="value">{{ colis()!.id }}</span>
            </div>

            <mat-divider></mat-divider>

            <!-- Status Timeline -->
            <div class="timeline-section">
              <h3>Suivi de livraison</h3>
              <mat-stepper [selectedIndex]="getStatusIndex()" orientation="vertical">
                <mat-step [completed]="isStatusCompleted('CREE')">
                  <ng-template matStepLabel>
                    <div class="step-label">
                      <span>Créé</span>
                      <span class="step-date" *ngIf="colis()!.dateCreation">
                        {{ colis()!.dateCreation | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>
                  </ng-template>
                  <p>Colis enregistré dans le système</p>
                </mat-step>

                <mat-step [completed]="isStatusCompleted('EN_TRANSIT')">
                  <ng-template matStepLabel>
                    <div class="step-label">
                      <span>En Transit</span>
                      <span class="step-date">{{ colis()!.statut === 'EN_TRANSIT' ? 'En cours' : '-' }}</span>
                    </div>
                  </ng-template>
                  <p>Colis en cours de livraison</p>
                </mat-step>

                <mat-step [completed]="isStatusCompleted('LIVRE')">
                  <ng-template matStepLabel>
                    <div class="step-label">
                      <span>Livré</span>
                      <span class="step-date" *ngIf="colis()!.dateLivraison">
                        {{ colis()!.dateLivraison | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>
                  </ng-template>
                  <p>Colis livré avec succès</p>
                </mat-step>
              </mat-stepper>
            </div>

            <mat-divider></mat-divider>

            <!-- Package Info -->
            <div class="detail-section">
              <div class="section-header">
                <mat-icon>inventory_2</mat-icon>
                <h3>Informations du Colis</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Description</span>
                  <span class="value">{{ colis()!.description }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Poids</span>
                  <span class="value">{{ colis()!.poids }} kg</span>
                </div>
                <div class="info-item">
                  <span class="label">Priorité</span>
                  <span class="value">
                    <mat-chip [ngClass]="getPriorityClass(colis()!.priorite)">
                      {{ getPriorityLabel(colis()!.priorite) }}
                    </mat-chip>
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Statut</span>
                  <span class="value">
                    <mat-chip [ngClass]="getStatusClass(colis()!.statut)">
                      {{ getStatusLabel(colis()!.statut) }}
                    </mat-chip>
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Ville de destination</span>
                  <span class="value">{{ colis()!.villeDestination }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Date limite</span>
                  <span class="value">{{ colis()!.dateLimiteLivraison | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Sender & Receiver -->
            <div class="detail-section">
              <div class="section-header">
                <mat-icon>people</mat-icon>
                <h3>Expéditeur et Destinataire</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Expéditeur</span>
                  <span class="value">{{ colis()!.clientExpediteur?.nom || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Destinataire</span>
                  <span class="value">{{ colis()!.destinataire?.nom || '-' }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="label">Adresse de livraison</span>
                  <span class="value">{{ colis()!.destinataire?.adresse || '-' }}</span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Delivery Info -->
            <div class="detail-section" *ngIf="colis()!.livreur?.nom">
              <div class="section-header">
                <mat-icon>local_shipping</mat-icon>
                <h3>Informations de Livraison</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Livreur</span>
                  <span class="value">{{ colis()!.livreur?.nom }}</span>
                </div>
                <div class="info-item" *ngIf="colis()!.livreur?.telephone">
                  <span class="label">Téléphone livreur</span>
                  <span class="value">{{ colis()!.livreur?.telephone }}</span>
                </div>
                <div class="info-item" *ngIf="colis()!.livreur?.vehicule">
                  <span class="label">Véhicule</span>
                  <span class="value">{{ colis()!.livreur?.vehicule }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons (Manager Only) -->
            <div class="action-buttons" *ngIf="isManager()">
              <button mat-raised-button [routerLink]="['/colis', colis()!.id, 'edit']" color="primary">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-raised-button color="warn" (click)="deleteColis()">
                <mat-icon>delete</mat-icon>
                Supprimer
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .access-denied {
      text-align: center;
      padding: 60px 20px !important;
    }

    .access-denied mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #f44336;
      margin-bottom: 20px;
    }

    .access-denied h2 {
      margin: 0 0 12px 0;
      color: #f44336;
    }

    .access-denied p {
      margin: 0 0 24px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 16px 0;
    }

    .header-content h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .detail-content {
      padding: 20px 0;
    }

    .tracking-number {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .tracking-number .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
    }

    .tracking-number .value {
      font-family: monospace;
      font-size: 14px;
      color: #1976d2;
      padding: 4px 8px;
      background: white;
      border-radius: 4px;
    }

    .timeline-section {
      margin-bottom: 32px;
    }

    .timeline-section h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 500;
      color: #1976d2;
    }

    .step-label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .step-date {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .detail-section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      color: #1976d2;
    }

    .section-header mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: rgba(0, 0, 0, 0.6);
    }

    .value {
      font-size: 16px;
      color: #333;
    }

    .status-cree { background-color: #2196F3 !important; color: white !important; }
    .status-collecte { background-color: #00BCD4 !important; color: white !important; }
    .status-en-stock { background-color: #FF9800 !important; color: white !important; }
    .status-en-transit { background-color: #9C27B0 !important; color: white !important; }
    .status-livre { background-color: #4CAF50 !important; color: white !important; }
    .status-annule { background-color: #F44336 !important; color: white !important; }
    .status-retourne { background-color: #607D8B !important; color: white !important; }

    .priority-basse { background-color: #9E9E9E !important; color: white !important; }
    .priority-normale { background-color: #2196F3 !important; color: white !important; }
    .priority-haute { background-color: #FF9800 !important; color: white !important; }
    .priority-urgente { background-color: #F44336 !important; color: white !important; }

    mat-divider {
      margin: 32px 0;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 32px;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class ColisDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private colisService = inject(ColisService);
  private authService = inject(AuthService);

  colis = signal<Colis | null>(null);
  loading = signal(false);
  accessDenied = signal(false);

  isManager = computed(() => this.authService.hasRole('ROLE_MANAGER'));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadColis(id);
    }
  }

  loadColis(id: string) {
    this.loading.set(true);
    this.colisService.getById(id).subscribe({
      next: (colis) => {
        this.colis.set(colis);
        this.accessDenied.set(false);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading colis:', error);

        // ✅ Handle forbidden access
        if (error.status === 403) {
          this.accessDenied.set(true);
          this.loading.set(false);
        } else {
          // Other errors, redirect to list
          this.router.navigate(['/colis']);
        }
      }
    });
  }

  copyTrackingId() {
    const id = this.colis()?.id;
    if (!id) return;

    navigator.clipboard.writeText(id).then(() => {
      alert('Numéro de suivi copié! Vous pouvez le partager pour suivre le colis.');
    }).catch(() => {
      alert('Erreur lors de la copie');
    });
  }

  getStatusIndex(): number {
    const status = this.colis()?.statut;
    if (status === 'LIVRE') return 2;
    if (status === 'EN_TRANSIT' || status === 'EN_STOCK') return 1;
    return 0;
  }

  isStatusCompleted(status: string): boolean {
    const currentStatus = this.colis()?.statut;
    const order = ['CREE', 'EN_TRANSIT', 'LIVRE'];
    const currentIndex = order.indexOf(currentStatus || '');
    const checkIndex = order.indexOf(status);
    return currentIndex >= checkIndex;
  }

  getStatusClass(status?: StatutColis): string {
    return `status-${status?.toLowerCase().replace('_', '-') || 'unknown'}`;
  }

  getStatusLabel(status?: StatutColis): string {
    const labels: Record<string, string> = {
      'CREE': 'Créé',
      'COLLECTE': 'Collecté',
      'EN_STOCK': 'En Stock',
      'EN_TRANSIT': 'En Transit',
      'LIVRE': 'Livré',
      'ANNULE': 'Annulé',
      'RETOURNE': 'Retourné'
    };
    return labels[status || ''] || status || 'Inconnu';
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'BASSE': 'Basse',
      'NORMALE': 'Normale',
      'HAUTE': 'Haute',
      'URGENTE': 'Urgente'
    };
    return labels[priority] || priority;
  }

  deleteColis() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce colis?')) {
      this.colisService.delete(this.colis()!.id!).subscribe({
        next: () => this.router.navigate(['/colis']),
        error: (error) => alert('Erreur lors de la suppression')
      });
    }
  }
}
