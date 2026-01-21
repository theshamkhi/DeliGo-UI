import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { LivreurService } from '../../../core/services/livreur.service';
import { Livreur } from '../../../core/models/livreur.model';

@Component({
  selector: 'app-livreur-detail',
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
    MatTableModule
  ],
  template: `
    <div class="detail-container">
      <mat-card>
        <mat-card-header>
          <div class="header-content">
            <h2>Détail Livreur</h2>
            <button mat-icon-button routerLink="/livreurs">
              <mat-icon>arrow_back</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading() && livreur()" class="detail-content">
            <!-- Personal Info -->
            <div class="detail-section">
              <div class="section-header">
                <mat-icon>local_shipping</mat-icon>
                <h3>Informations du Livreur</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Nom complet</span>
                  <span class="value">{{ livreur()!.prenom }} {{ livreur()!.nom }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Téléphone</span>
                  <span class="value">
                    <mat-icon class="inline-icon">phone</mat-icon>
                    {{ livreur()!.telephone }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Véhicule</span>
                  <span class="value">
                    <mat-icon class="inline-icon">two_wheeler</mat-icon>
                    {{ livreur()!.vehicule }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Statut</span>
                  <span class="value">
                    <mat-chip [class.active-chip]="livreur()!.actif" [class.inactive-chip]="!livreur()!.actif">
                      {{ livreur()!.actif ? 'Actif' : 'Inactif' }}
                    </mat-chip>
                  </span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Zone Assignment -->
            <div class="detail-section">
              <div class="section-header">
                <mat-icon>map</mat-icon>
                <h3>Zone Assignée</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Zone</span>
                  <span class="value">{{ livreur()!.zoneAssignee?.nom || 'Non assignée' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Code Postal</span>
                  <span class="value">{{ livreur()!.zoneAssignee?.codePostal || '-' }}</span>
                </div>
                <div class="info-item full-width" *ngIf="livreur()!.zoneAssignee?.description">
                  <span class="label">Description</span>
                  <span class="value">{{ livreur()!.zoneAssignee?.description }}</span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- System Info -->
            <div class="detail-section">
              <div class="section-header">
                <mat-icon>info</mat-icon>
                <h3>Informations Système</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Date de création</span>
                  <span class="value">{{ livreur()!.dateCreation | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Dernière modification</span>
                  <span class="value">{{ livreur()!.dateModification | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </div>

            <!-- Statistics Section -->
            <mat-divider></mat-divider>

            <div class="detail-section">
              <div class="section-header">
                <mat-icon>analytics</mat-icon>
                <h3>Statistiques de Livraison</h3>
              </div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">
                    <mat-icon>inventory_2</mat-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">24</span>
                    <span class="stat-label">Colis en cours</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon success">
                    <mat-icon>check_circle</mat-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">156</span>
                    <span class="stat-label">Livraisons réussies</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon warning">
                    <mat-icon>schedule</mat-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">3</span>
                    <span class="stat-label">En retard</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button mat-raised-button [routerLink]="['/livreurs', livreur()!.id, 'edit']" color="primary">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-raised-button color="accent" (click)="toggleStatus()">
                <mat-icon>{{ livreur()!.actif ? 'block' : 'check_circle' }}</mat-icon>
                {{ livreur()!.actif ? 'Désactiver' : 'Activer' }}
              </button>
              <button mat-raised-button color="warn" (click)="deleteLivreur()">
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

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .detail-content {
      padding: 20px 0;
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
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 16px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .inline-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: rgba(0, 0, 0, 0.54);
    }

    .active-chip {
      background-color: #4CAF50 !important;
      color: white !important;
    }

    .inactive-chip {
      background-color: #9E9E9E !important;
      color: white !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #1976d2;
      color: white;
    }

    .stat-icon.success {
      background: #4CAF50;
    }

    .stat-icon.warning {
      background: #FF9800;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
    }

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

      .stats-grid {
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
export class LivreurDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private livreurService = inject(LivreurService);

  livreur = signal<Livreur | null>(null);
  loading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLivreur(id);
    }
  }

  loadLivreur(id: string) {
    this.loading.set(true);
    this.livreurService.getById(id).subscribe({
      next: (livreur) => {
        this.livreur.set(livreur);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading livreur:', error);
        alert('Erreur lors du chargement du livreur');
        this.router.navigate(['/livreurs']);
      }
    });
  }

  toggleStatus() {
    const current = this.livreur()!;
    const updated = { ...current, actif: !current.actif };

    this.livreurService.update(current.id!, updated).subscribe({
      next: (livreur) => {
        this.livreur.set(livreur);
        alert(`Livreur ${livreur.actif ? 'activé' : 'désactivé'} avec succès`);
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  deleteLivreur() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.livreur()!.prenom} ${this.livreur()!.nom}?`)) {
      this.livreurService.delete(this.livreur()!.id!).subscribe({
        next: () => {
          this.router.navigate(['/livreurs']);
        },
        error: (error) => {
          console.error('Error deleting livreur:', error);
          alert('Erreur lors de la suppression du livreur');
        }
      });
    }
  }
}
