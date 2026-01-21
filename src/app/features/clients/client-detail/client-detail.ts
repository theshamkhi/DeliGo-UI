import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="detail-container">
      <mat-card>
        <mat-card-header>
          <div class="header-content">
            <h2>Détail Client</h2>
            <div class="actions">
              <button mat-icon-button routerLink="/clients" matTooltip="Retour">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading() && client()" class="detail-content">
            <div class="detail-section">
              <div class="section-header">
                <mat-icon>person</mat-icon>
                <h3>Informations Personnelles</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Nom complet</span>
                  <span class="value">{{ client()!.prenom }} {{ client()!.nom }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email</span>
                  <span class="value">
                    <mat-icon class="inline-icon">email</mat-icon>
                    {{ client()!.email }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Téléphone</span>
                  <span class="value">
                    <mat-icon class="inline-icon">phone</mat-icon>
                    {{ client()!.telephone }}
                  </span>
                </div>
                <div class="info-item full-width">
                  <span class="label">Adresse</span>
                  <span class="value">
                    <mat-icon class="inline-icon">location_on</mat-icon>
                    {{ client()!.adresse }}
                  </span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="detail-section">
              <div class="section-header">
                <mat-icon>info</mat-icon>
                <h3>Informations Système</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Date de création</span>
                  <span class="value">{{ client()!.dateCreation | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Dernière modification</span>
                  <span class="value">{{ client()!.dateModification | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <button mat-raised-button [routerLink]="['/clients', client()!.id, 'edit']" color="primary">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-raised-button color="warn" (click)="deleteClient()">
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
      max-width: 1000px;
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
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);

  client = signal<Client | null>(null);
  loading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    }
  }

  loadClient(id: string) {
    this.loading.set(true);
    this.clientService.getById(id).subscribe({
      next: (client) => {
        this.client.set(client);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading client:', error);
        alert('Erreur lors du chargement du client');
        this.router.navigate(['/clients']);
      }
    });
  }

  deleteClient() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.client()!.prenom} ${this.client()!.nom}?`)) {
      this.clientService.delete(this.client()!.id!).subscribe({
        next: () => {
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          alert('Erreur lors de la suppression du client');
        }
      });
    }
  }
}
