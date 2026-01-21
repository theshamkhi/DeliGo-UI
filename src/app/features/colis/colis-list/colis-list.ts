import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ColisService } from '../../../core/services/colis.service';
import { LivreurService } from '../../../core/services/livreur.service';
import { AuthService } from '../../../core/services/auth.service';
import { Colis, StatutColis, PrioriteColis } from '../../../core/models/colis.model';
import { Livreur } from '../../../core/models/livreur.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-colis-list',
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
    MatSelectModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <div class="colis-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>{{ getTitle() }}</h2>
              <button *ngIf="canCreateColis()"
                      mat-raised-button
                      color="primary"
                      routerLink="/colis/new">
                <mat-icon>add</mat-icon>
                {{ isClient() ? 'Nouvelle Demande' : 'Nouveau Colis' }}
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="filters-row">
            <mat-form-field class="search-field" appearance="outline">
              <mat-label>Rechercher un colis</mat-label>
              <input matInput
                     [(ngModel)]="searchKeyword"
                     (ngModelChange)="onSearchChange($event)"
                     placeholder="Description, ville...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field *ngIf="isManager()" appearance="outline" class="status-filter">
              <mat-label>Filtrer par statut</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="onFilterChange()">
                <mat-option [value]="null">Tous</mat-option>
                <mat-option [value]="'CREE'">Créé</mat-option>
                <mat-option [value]="'COLLECTE'">Collecté</mat-option>
                <mat-option [value]="'EN_STOCK'">En Stock</mat-option>
                <mat-option [value]="'EN_TRANSIT'">En Transit</mat-option>
                <mat-option [value]="'LIVRE'">Livré</mat-option>
                <mat-option [value]="'ANNULE'">Annulé</mat-option>
                <mat-option [value]="'RETOURNE'">Retourné</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading()" class="table-container">
            <table mat-table [dataSource]="colis()" class="mat-elevation-z2">
              <!-- Tracking ID Column (for copying) -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>N° Suivi</th>
                <td mat-cell *matCellDef="let col">
                  <button mat-icon-button
                          (click)="copyTrackingId(col.id)"
                          matTooltip="Copier le numéro de suivi">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                  <span class="tracking-id">{{ col.id?.substring(0, 8) }}...</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let col">{{ col.description }}</td>
              </ng-container>

              <ng-container matColumnDef="expediteur">
                <th mat-header-cell *matHeaderCellDef>Expéditeur</th>
                <td mat-cell *matCellDef="let col">
                  {{ col.clientExpediteurNom || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="destinataire">
                <th mat-header-cell *matHeaderCellDef>Destinataire</th>
                <td mat-cell *matCellDef="let col">
                  {{ col.destinataireNom || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="ville">
                <th mat-header-cell *matHeaderCellDef>Ville</th>
                <td mat-cell *matCellDef="let col">{{ col.villeDestination }}</td>
              </ng-container>

              <ng-container matColumnDef="poids">
                <th mat-header-cell *matHeaderCellDef>Poids</th>
                <td mat-cell *matCellDef="let col">{{ col.poids }} kg</td>
              </ng-container>

              <ng-container matColumnDef="priorite">
                <th mat-header-cell *matHeaderCellDef>Priorité</th>
                <td mat-cell *matCellDef="let col">
                  <mat-chip [ngClass]="getPriorityClass(col.priorite)">
                    {{ getPriorityLabel(col.priorite) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let col">
                  <mat-chip [ngClass]="getStatusClass(col.statut)">
                    {{ getStatusLabel(col.statut) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="livreur">
                <th mat-header-cell *matHeaderCellDef>Livreur</th>
                <td mat-cell *matCellDef="let col">
                  <span *ngIf="!col.livreurNom" class="no-livreur">Non assigné</span>
                  <span *ngIf="col.livreurNom">{{ col.livreurNom }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let col">
                  <button mat-icon-button
                          [routerLink]="['/colis', col.id]"
                          matTooltip="Voir détails"
                          color="primary">
                    <mat-icon>visibility</mat-icon>
                  </button>

                  <!-- Livreur can update status -->
                  <button *ngIf="isLivreur()"
                          mat-icon-button
                          [matMenuTriggerFor]="statusMenuLivreur"
                          matTooltip="Mettre à jour"
                          color="accent">
                    <mat-icon>update</mat-icon>
                  </button>
                  <mat-menu #statusMenuLivreur="matMenu">
                    <button mat-menu-item (click)="updateStatus(col, 'COLLECTE')">
                      <mat-icon>check</mat-icon>
                      <span>Collecté</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(col, 'EN_TRANSIT')">
                      <mat-icon>local_shipping</mat-icon>
                      <span>En Transit</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(col, 'LIVRE')">
                      <mat-icon>check_circle</mat-icon>
                      <span>Livré</span>
                    </button>
                  </mat-menu>

                  <!-- Manager can do everything -->
                  <button *ngIf="isManager()"
                          mat-icon-button
                          [matMenuTriggerFor]="statusMenuManager"
                          matTooltip="Changer statut"
                          color="accent">
                    <mat-icon>update</mat-icon>
                  </button>
                  <mat-menu #statusMenuManager="matMenu">
                    <button mat-menu-item (click)="updateStatus(col, 'CREE')">
                      <mat-icon>fiber_new</mat-icon>
                      <span>Créé</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(col, 'COLLECTE')">
                      <mat-icon>check</mat-icon>
                      <span>Collecté</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(col, 'EN_STOCK')">
                      <mat-icon>warehouse</mat-icon>
                      <span>En Stock</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(col, 'EN_TRANSIT')">
                      <mat-icon>local_shipping</mat-icon>
                      <span>En Transit</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(col, 'LIVRE')">
                      <mat-icon>check_circle</mat-icon>
                      <span>Livré</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(col, 'ANNULE')">
                      <mat-icon>cancel</mat-icon>
                      <span>Annulé</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(col, 'RETOURNE')">
                      <mat-icon>keyboard_return</mat-icon>
                      <span>Retourné</span>
                    </button>
                  </mat-menu>

                  <!-- Manager: Assign Livreur -->
                  <button *ngIf="isManager() && !col.livreurNom"
                          mat-icon-button
                          (click)="openAssignDialog(col)"
                          matTooltip="Assigner un livreur"
                          color="primary">
                    <mat-icon>assignment_ind</mat-icon>
                  </button>

                  <!-- Manager: Edit & Delete -->
                  <button *ngIf="isManager()"
                          mat-icon-button
                          [routerLink]="['/colis', col.id, 'edit']"
                          matTooltip="Modifier"
                          color="accent">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button *ngIf="isManager()"
                          mat-icon-button
                          (click)="deleteColis(col)"
                          matTooltip="Supprimer"
                          color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns();"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [colSpan]="displayedColumns().length">
                  <div class="no-data">
                    <mat-icon>inbox</mat-icon>
                    <p>Aucun colis trouvé</p>
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
    .colis-list-container {
      padding: 20px;
      max-width: 1600px;
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

    .filters-row {
      display: grid;
      grid-template-columns: 1fr 250px;
      gap: 20px;
      margin-bottom: 20px;
    }

    .search-field {
      width: 100%;
    }

    .status-filter {
      width: 100%;
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

    .tracking-id {
      font-family: monospace;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-livreur {
      color: rgba(0, 0, 0, 0.38);
      font-style: italic;
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
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ColisListComponent implements OnInit {
  private colisService = inject(ColisService);
  private livreurService = inject(LivreurService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  colis = signal<Colis[]>([]);
  pageResponse = signal<PageResponse<Colis> | null>(null);
  loading = signal(false);

  currentPage = 0;
  pageSize = 20;
  searchKeyword = '';
  statusFilter: StatutColis | null = null;

  private searchSubject = new Subject<string>();

  // Role checks
  isManager = computed(() => this.authService.hasRole('ROLE_MANAGER'));
  isLivreur = computed(() => this.authService.hasRole('ROLE_LIVREUR'));
  isClient = computed(() => this.authService.hasRole('ROLE_CLIENT'));

  displayedColumns = computed(() => {
    if (this.isManager()) {
      return ['id', 'description', 'expediteur', 'destinataire', 'ville', 'poids', 'priorite', 'statut', 'livreur', 'actions'];
    } else if (this.isLivreur()) {
      return ['id', 'description', 'destinataire', 'ville', 'poids', 'priorite', 'statut', 'actions'];
    } else { // Client
      return ['id', 'description', 'destinataire', 'ville', 'poids', 'priorite', 'statut', 'actions'];
    }
  });

  ngOnInit() {
    this.loadColis();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(keyword => {
      this.currentPage = 0;
      if (keyword.trim()) {
        this.searchColis(keyword);
      } else {
        this.loadColis();
      }
    });
  }

  loadColis() {
    this.loading.set(true);

    const pageRequest = {
      page: this.currentPage,
      size: this.pageSize,
      sort: 'dateCreation,desc'
    };

    this.colisService.getAll(pageRequest).subscribe({
      next: (response) => {
        let filteredContent = response.content;

        if (this.statusFilter && this.isManager()) {
          filteredContent = filteredContent.filter(c => c.statut === this.statusFilter);
        }

        this.pageResponse.set(response);
        this.colis.set(filteredContent);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading colis:', error);
        this.loading.set(false);
      }
    });
  }

  searchColis(keyword: string) {
    this.loading.set(true);
    this.colisService.search(keyword, {
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.colis.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching colis:', error);
        this.loading.set(false);
      }
    });
  }

  onSearchChange(keyword: string) {
    this.searchSubject.next(keyword);
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadColis();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.searchKeyword.trim()) {
      this.searchColis(this.searchKeyword);
    } else {
      this.loadColis();
    }
  }

  updateStatus(col: Colis, newStatus: string) {
    this.colisService.updateStatus(col.id!, newStatus).subscribe({
      next: () => {
        this.loadColis();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  openAssignDialog(col: Colis) {
    // Load active livreurs
    this.livreurService.getActive().subscribe({
      next: (livreurs) => {
        const selectedLivreur = prompt(
          `Assigner ce colis à:\n${livreurs.map((l, i) => `${i + 1}. ${l.prenom} ${l.nom}`).join('\n')}\n\nEntrez le numéro:`
        );

        if (selectedLivreur) {
          const index = parseInt(selectedLivreur) - 1;
          if (index >= 0 && index < livreurs.length) {
            this.assignLivreur(col.id!, livreurs[index].id!);
          }
        }
      },
      error: (error) => {
        console.error('Error loading livreurs:', error);
        alert('Erreur lors du chargement des livreurs');
      }
    });
  }

  assignLivreur(colisId: string, livreurId: string) {
    this.colisService.assignLivreur(colisId, livreurId).subscribe({
      next: () => {
        this.loadColis();
      },
      error: (error) => {
        console.error('Error assigning livreur:', error);
        alert('Erreur lors de l\'assignation du livreur');
      }
    });
  }

  deleteColis(col: Colis) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce colis?`)) {
      this.colisService.delete(col.id!).subscribe({
        next: () => {
          this.loadColis();
        },
        error: (error) => {
          console.error('Error deleting colis:', error);
          alert('Erreur lors de la suppression du colis');
        }
      });
    }
  }

  copyTrackingId(id: string | undefined) {
    if (!id) return;

    navigator.clipboard.writeText(id).then(() => {
      alert('Numéro de suivi copié!');
    }).catch(() => {
      alert('Erreur lors de la copie');
    });
  }

  canCreateColis(): boolean {
    return this.isManager() || this.isClient();
  }

  getTitle(): string {
    if (this.isManager()) return 'Liste des Colis';
    if (this.isLivreur()) return 'Mes Livraisons';
    if (this.isClient()) return 'Mes Envois';
    return 'Colis';
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

  getPriorityClass(priority: PrioriteColis): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityLabel(priority: PrioriteColis): string {
    const labels: Record<string, string> = {
      'BASSE': 'Basse',
      'NORMALE': 'Normale',
      'HAUTE': 'Haute',
      'URGENTE': 'Urgente'
    };
    return labels[priority] || priority;
  }
}
