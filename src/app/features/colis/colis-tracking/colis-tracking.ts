import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ColisService } from '../../../core/services/colis.service';
import { Colis, StatutColis } from '../../../core/models/colis.model';

@Component({
  selector: 'app-colis-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="tracking-container">
      <div class="tracking-header">
        <div class="logo">🚚 DeliGo</div>
        <h1>Suivi de Colis</h1>
        <p>Suivez votre colis en temps réel</p>
      </div>

      <mat-card class="search-card">
        <mat-card-content>
          <div class="search-section">
            <mat-form-field appearance="outline" class="tracking-input">
              <mat-label>Numéro de suivi</mat-label>
              <input matInput
                     [(ngModel)]="trackingId"
                     placeholder="Entrez votre numéro de colis"
                     (keyup.enter)="trackColis()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button
                    color="primary"
                    (click)="trackColis()"
                    [disabled]="!trackingId || loading()">
              <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
              <span *ngIf="!loading()">Suivre</span>
            </button>
          </div>

          <div *ngIf="error()" class="error-message">
            <mat-icon>error</mat-icon>
            <span>{{ error() }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="colis()" class="result-card">
        <mat-card-content>
          <!-- Status Banner -->
          <div class="status-banner" [ngClass]="getStatusClass(colis()!.statut)">
            <mat-icon>{{ getStatusIcon(colis()!.statut) }}</mat-icon>
            <div class="status-info">
              <h2>{{ getStatusLabel(colis()!.statut) }}</h2>
              <p>{{ getStatusMessage(colis()!.statut) }}</p>
            </div>
          </div>

          <!-- Timeline -->
          <div class="timeline-section">
            <h3>Historique de livraison</h3>
            <mat-stepper [selectedIndex]="getStatusIndex()" orientation="vertical">
              <mat-step [completed]="isStatusCompleted('EN_ATTENTE')">
                <ng-template matStepLabel>
                  <div class="step-content">
                    <div class="step-header">
                      <strong>Colis enregistré</strong>
                      <span class="step-time">{{ colis()!.dateCreation | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    <p>Votre colis a été enregistré dans notre système</p>
                  </div>
                </ng-template>
              </mat-step>

              <mat-step [completed]="isStatusCompleted('EN_TRANSIT')">
                <ng-template matStepLabel>
                  <div class="step-content">
                    <div class="step-header">
                      <strong>En cours de livraison</strong>
                      <span class="step-time">{{ colis()!.statut === 'EN_TRANSIT' ? 'En cours' : '-' }}</span>
                    </div>
                    <p>Votre colis est en route vers sa destination</p>
                    <p *ngIf="colis()!.livreur" class="driver-info">
                      <mat-icon>person</mat-icon>
                      Livreur: {{ colis()!.livreur?.prenom }} {{ colis()!.livreur?.nom }}
                    </p>
                  </div>
                </ng-template>
              </mat-step>

              <mat-step [completed]="isStatusCompleted('LIVRE')">
                <ng-template matStepLabel>
                  <div class="step-content">
                    <div class="step-header">
                      <strong>Livré</strong>
                      <span class="step-time">{{ colis()!.dateLivraison ? (colis()!.dateLivraison | date:'dd/MM/yyyy HH:mm') : '-' }}</span>
                    </div>
                    <p>Colis livré avec succès</p>
                  </div>
                </ng-template>
              </mat-step>
            </mat-stepper>
          </div>

          <mat-divider></mat-divider>

          <!-- Package Details -->
          <div class="details-section">
            <h3>Détails du colis</h3>
            <div class="details-grid">
              <div class="detail-item">
                <mat-icon>inventory_2</mat-icon>
                <div>
                  <span class="detail-label">Description</span>
                  <span class="detail-value">{{ colis()!.description }}</span>
                </div>
              </div>

              <div class="detail-item">
                <mat-icon>location_city</mat-icon>
                <div>
                  <span class="detail-label">Destination</span>
                  <span class="detail-value">{{ colis()!.villeDestination }}</span>
                </div>
              </div>

              <div class="detail-item">
                <mat-icon>scale</mat-icon>
                <div>
                  <span class="detail-label">Poids</span>
                  <span class="detail-value">{{ colis()!.poids }} kg</span>
                </div>
              </div>

              <div class="detail-item">
                <mat-icon>priority_high</mat-icon>
                <div>
                  <span class="detail-label">Priorité</span>
                  <mat-chip [ngClass]="getPriorityClass(colis()!.priorite)">
                    {{ getPriorityLabel(colis()!.priorite) }}
                  </mat-chip>
                </div>
              </div>

              <div class="detail-item" *ngIf="colis()!.dateLimiteLivraison">
                <mat-icon>event</mat-icon>
                <div>
                  <span class="detail-label">Date limite de livraison</span>
                  <span class="detail-value">{{ colis()!.dateLimiteLivraison | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Contact Info -->
          <div class="contact-section">
            <h3>Besoin d'aide?</h3>
            <p>Pour toute question concernant votre livraison, contactez-nous:</p>
            <div class="contact-methods">
              <div class="contact-item">
                <mat-icon>phone</mat-icon>
                <span>+212 5XX-XXXXXX</span>
              </div>
              <div class="contact-item">
                <mat-icon>email</mat-icon>
                <span>support&#64;deligo.com</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .tracking-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }

    .tracking-header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .logo {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .tracking-header h1 {
      margin: 0 0 8px 0;
      font-size: 36px;
      font-weight: 600;
    }

    .tracking-header p {
      margin: 0;
      font-size: 18px;
      opacity: 0.9;
    }

    .search-card, .result-card {
      max-width: 800px;
      margin: 0 auto 20px auto;
    }

    .search-section {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .tracking-input {
      flex: 1;
    }

    .search-section button {
      height: 56px;
      min-width: 120px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      border-radius: 4px;
      color: #c62828;
    }

    .status-banner {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 32px;
    }

    .status-banner mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .status-banner.status-en-attente {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-banner.status-en-transit {
      background-color: #f3e5f5;
      color: #6a1b9a;
    }

    .status-banner.status-livre {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-info h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .status-info p {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
    }

    .timeline-section {
      margin-bottom: 32px;
    }

    .timeline-section h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .step-content {
      width: 100%;
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .step-time {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
    }

    .step-content p {
      margin: 4px 0;
      color: rgba(0, 0, 0, 0.7);
    }

    .driver-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #1976d2 !important;
    }

    .driver-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .details-section {
      margin-bottom: 32px;
    }

    .details-section h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .detail-item mat-icon {
      color: #1976d2;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .detail-item > div {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 12px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
    }

    .detail-value {
      font-size: 15px;
      color: #333;
    }

    .priority-basse { background-color: #9E9E9E !important; color: white !important; }
    .priority-normale { background-color: #2196F3 !important; color: white !important; }
    .priority-haute { background-color: #FF9800 !important; color: white !important; }
    .priority-urgente { background-color: #F44336 !important; color: white !important; }

    .contact-section h3 {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .contact-section p {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.7);
    }

    .contact-methods {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
    }

    .contact-item mat-icon {
      color: #1976d2;
    }

    mat-divider {
      margin: 32px 0;
    }

    @media (max-width: 768px) {
      .search-section {
        flex-direction: column;
      }

      .search-section button {
        width: 100%;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ColisTrackingComponent {
  private colisService = inject(ColisService);

  trackingId = '';
  colis = signal<Colis | null>(null);
  loading = signal(false);
  error = signal<string>('');

  trackColis() {
    if (!this.trackingId.trim()) {
      this.error.set('Veuillez entrer un numéro de suivi');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.colis.set(null);

    this.colisService.getById(this.trackingId).subscribe({
      next: (colis) => {
        this.colis.set(colis);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Colis non trouvé. Vérifiez le numéro de suivi.');
        this.loading.set(false);
      }
    });
  }

  getStatusIndex(): number {
    const status = this.colis()?.statut;
    if (status === 'LIVRE') return 2;
    if (status === 'EN_TRANSIT') return 1;
    return 0;
  }

  isStatusCompleted(status: string): boolean {
    const currentStatus = this.colis()?.statut;
    const order = ['EN_ATTENTE', 'EN_TRANSIT', 'LIVRE'];
    const currentIndex = order.indexOf(currentStatus || '');
    const checkIndex = order.indexOf(status);
    return currentIndex >= checkIndex;
  }

  getStatusClass(status?: StatutColis): string {
    return `status-${status?.toLowerCase().replace('_', '-') || 'unknown'}`;
  }

  getStatusLabel(status?: StatutColis): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En Attente',
      'EN_TRANSIT': 'En Transit',
      'LIVRE': 'Livré',
      'ANNULE': 'Annulé',
      'RETOURNE': 'Retourné'
    };
    return labels[status || ''] || 'Inconnu';
  }

  getStatusIcon(status?: StatutColis): string {
    const icons: Record<string, string> = {
      'EN_ATTENTE': 'schedule',
      'EN_TRANSIT': 'local_shipping',
      'LIVRE': 'check_circle',
      'ANNULE': 'cancel',
      'RETOURNE': 'keyboard_return'
    };
    return icons[status || ''] || 'info';
  }

  getStatusMessage(status?: StatutColis): string {
    const messages: Record<string, string> = {
      'EN_ATTENTE': 'Votre colis est en attente de prise en charge',
      'EN_TRANSIT': 'Votre colis est en cours de livraison',
      'LIVRE': 'Votre colis a été livré avec succès',
      'ANNULE': 'Votre colis a été annulé',
      'RETOURNE': 'Votre colis a été retourné'
    };
    return messages[status || ''] || 'Statut inconnu';
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
}
