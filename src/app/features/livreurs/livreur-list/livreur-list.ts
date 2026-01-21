import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LivreurService } from '../../../core/services/livreur.service';
import { AuthService } from '../../../core/services/auth.service';
import { Livreur } from '../../../core/models/livreur.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-livreur-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="livreur-list-container">
      <!-- Access Denied for non-managers -->
      <mat-card *ngIf="!isManager()">
        <mat-card-content class="access-denied">
          <mat-icon>lock</mat-icon>
          <h2>Accès Refusé</h2>
          <p>Seuls les gestionnaires peuvent accéder à cette page.</p>
          <button mat-raised-button color="primary" routerLink="/dashboard">
            Retour au tableau de bord
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Main Content (Manager Only) -->
      <mat-card *ngIf="isManager()">
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>Liste des Livreurs</h2>
              <button mat-raised-button color="primary" routerLink="/livreurs/new">
                <mat-icon>add</mat-icon>
                Nouveau Livreur
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="filters-row">
            <mat-form-field class="search-field" appearance="outline">
              <mat-label>Rechercher un livreur</mat-label>
              <input matInput
                     [(ngModel)]="searchKeyword"
                     (ngModelChange)="onSearchChange($event)"
                     placeholder="Nom, prénom, téléphone...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-slide-toggle
              [(ngModel)]="activeOnly"
              (change)="onFilterChange()"
              color="primary">
              Actifs uniquement
            </mat-slide-toggle>
          </div>

          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading()" class="table-container">
            <table mat-table [dataSource]="livreurs()" class="mat-elevation-z2">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let livreur">{{ livreur.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="prenom">
                <th mat-header-cell *matHeaderCellDef>Prénom</th>
                <td mat-cell *matCellDef="let livreur">{{ livreur.prenom }}</td>
              </ng-container>

              <ng-container matColumnDef="telephone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let livreur">{{ livreur.telephone }}</td>
              </ng-container>

              <ng-container matColumnDef="vehicule">
                <th mat-header-cell *matHeaderCellDef>Véhicule</th>
                <td mat-cell *matCellDef="let livreur">{{ livreur.vehicule }}</td>
              </ng-container>

              <ng-container matColumnDef="zone">
                <th mat-header-cell *matHeaderCellDef>Zone</th>
                <td mat-cell *matCellDef="let livreur">
                  {{ livreur.zoneAssigneeNom || 'Non assignée' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actif">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let livreur">
                  <mat-chip [class.active-chip]="livreur.actif" [class.inactive-chip]="!livreur.actif">
                    {{ livreur.actif ? 'Actif' : 'Inactif' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let livreur">
                  <button mat-icon-button
                          [routerLink]="['/livreurs', livreur.id]"
                          matTooltip="Voir détails"
                          color="primary">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button
                          [routerLink]="['/livreurs', livreur.id, 'edit']"
                          matTooltip="Modifier"
                          color="accent">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="deleteLivreur(livreur)"
                          matTooltip="Supprimer"
                          color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [colSpan]="displayedColumns.length">
                  <div class="no-data">
                    <mat-icon>inbox</mat-icon>
                    <p>Aucun livreur trouvé</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator
            *ngIf="!loading() && pageResponse()"
            [length]="pageResponse()?.totalElements || 0"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50, 100]"
            [pageIndex]="currentPage"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .livreur-list-container {
      padding: 20px;
      max-width: 1400px;
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

    .filters-row {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 20px;
    }

    .search-field {
      flex: 1;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .active-chip {
      background-color: #4CAF50 !important;
      color: white !important;
    }

    .inactive-chip {
      background-color: #9E9E9E !important;
      color: white !important;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: rgba(0, 0, 0, 0.54);
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    mat-card {
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class LivreurListComponent implements OnInit {
  private livreurService = inject(LivreurService);
  private authService = inject(AuthService);

  livreurs = signal<Livreur[]>([]);
  pageResponse = signal<PageResponse<Livreur> | null>(null);
  loading = signal(false);

  displayedColumns: string[] = ['nom', 'prenom', 'telephone', 'vehicule', 'zone', 'actif', 'actions'];
  currentPage = 0;
  pageSize = 20;
  searchKeyword = '';
  activeOnly = false;

  private searchSubject = new Subject<string>();

  ngOnInit() {
    if (!this.isManager()) {
      return; // Show access denied
    }

    this.loadLivreurs();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(keyword => {
      this.currentPage = 0;
      if (keyword.trim()) {
        this.searchLivreurs(keyword);
      } else {
        this.loadLivreurs();
      }
    });
  }

  isManager(): boolean {
    return this.authService.hasRole('ROLE_MANAGER');
  }

  loadLivreurs() {
    this.loading.set(true);

    if (this.activeOnly) {
      this.livreurService.getActive().subscribe({
        next: (livreurs) => {
          this.livreurs.set(livreurs);
          this.pageResponse.set(null);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading active livreurs:', error);
          this.loading.set(false);
        }
      });
    } else {
      this.livreurService.getAll({
        page: this.currentPage,
        size: this.pageSize,
        sort: 'nom,asc'
      }).subscribe({
        next: (response) => {
          this.pageResponse.set(response);
          this.livreurs.set(response.content);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading livreurs:', error);
          this.loading.set(false);
        }
      });
    }
  }

  searchLivreurs(keyword: string) {
    this.loading.set(true);
    this.livreurService.search(keyword, {
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.livreurs.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching livreurs:', error);
        this.loading.set(false);
      }
    });
  }

  onSearchChange(keyword: string) {
    this.searchSubject.next(keyword);
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadLivreurs();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.searchKeyword.trim()) {
      this.searchLivreurs(this.searchKeyword);
    } else {
      this.loadLivreurs();
    }
  }

  deleteLivreur(livreur: Livreur) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${livreur.prenom} ${livreur.nom}?`)) {
      this.livreurService.delete(livreur.id!).subscribe({
        next: () => {
          this.loadLivreurs();
        },
        error: (error) => {
          console.error('Error deleting livreur:', error);
          alert('Erreur lors de la suppression du livreur');
        }
      });
    }
  }
}
