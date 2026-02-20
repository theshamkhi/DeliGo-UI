import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
import { MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store';
import { ColisActions } from '../../../store/colis/colis.actions';
import {
  selectFilteredColis,
  selectColisLoading,
  selectTotalElements,
  selectStatusFilter,
  selectCurrentPage
} from '../../../store/colis/colis.selectors';
import {
  selectIsManager,
  selectIsLivreur,
  selectIsClient
} from '../../../store/auth/auth.selectors';
import { LivreurService } from '../../../core/services/livreur.service';
import { Colis, StatutColis, PrioriteColis } from '../../../core/models/colis.model';

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
              <h2>{{ getTitle() | async }}</h2>
              <button *ngIf="canCreateColis$ | async"
                      mat-raised-button
                      color="primary"
                      routerLink="/colis/new">
                <mat-icon>add</mat-icon>
                {{ (isClient$ | async) ? 'Nouvelle Demande' : 'Nouveau Colis' }}
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

            <mat-form-field *ngIf="isManager$ | async" appearance="outline" class="status-filter">
              <mat-label>Filtrer par statut</mat-label>
              <mat-select [value]="statusFilter$ | async" (selectionChange)="onFilterChange($event.value)">
                <mat-option [value]="null">Tous</mat-option>
                <mat-option value="CREE">Créé</mat-option>
                <mat-option value="COLLECTE">Collecté</mat-option>
                <mat-option value="EN_STOCK">En Stock</mat-option>
                <mat-option value="EN_TRANSIT">En Transit</mat-option>
                <mat-option value="LIVRE">Livré</mat-option>
                <mat-option value="ANNULE">Annulé</mat-option>
                <mat-option value="RETOURNE">Retourné</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div *ngIf="loading$ | async" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!(loading$ | async)" class="table-container">
            <table mat-table [dataSource]="(colis$ | async) || []" class="mat-elevation-z2">
              <!-- Tracking ID Column -->
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
                  <button *ngIf="isLivreur$ | async"
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
                  <button *ngIf="isManager$ | async"
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
                  <button *ngIf="(isManager$ | async) && !col.livreurNom"
                          mat-icon-button
                          (click)="openAssignDialog(col)"
                          matTooltip="Assigner un livreur"
                          color="primary">
                    <mat-icon>assignment_ind</mat-icon>
                  </button>

                  <!-- Manager: Edit & Delete -->
                  <button *ngIf="isManager$ | async"
                          mat-icon-button
                          [routerLink]="['/colis', col.id, 'edit']"
                          matTooltip="Modifier"
                          color="accent">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button *ngIf="isManager$ | async"
                          mat-icon-button
                          (click)="deleteColis(col)"
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
                    <p>Aucun colis trouvé</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator
            *ngIf="!(loading$ | async)"
            [length]="totalElements$ | async"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50, 100]"
            [pageIndex]="currentPage$ | async"
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
export class ColisListComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private livreurService = inject(LivreurService);
  private destroy$ = new Subject<void>();

  // Observables from store
  colis$: Observable<Colis[]> = this.store.select(selectFilteredColis);
  loading$: Observable<boolean> = this.store.select(selectColisLoading);
  totalElements$: Observable<number> = this.store.select(selectTotalElements);
  statusFilter$: Observable<StatutColis | null> = this.store.select(selectStatusFilter);
  currentPage$: Observable<number> = this.store.select(selectCurrentPage);

  isManager$: Observable<boolean> = this.store.select(selectIsManager);
  isLivreur$: Observable<boolean> = this.store.select(selectIsLivreur);
  isClient$: Observable<boolean> = this.store.select(selectIsClient);

  canCreateColis$: Observable<boolean> | undefined;

  pageSize = 20;
  searchKeyword = '';
  displayedColumns: string[] = [];

  private searchSubject = new Subject<string>();

  ngOnInit() {
    // Set displayed columns based on role
    this.isManager$.pipe(takeUntil(this.destroy$)).subscribe(isManager => {
      if (isManager) {
        this.displayedColumns = ['id', 'description', 'expediteur', 'destinataire', 'ville', 'poids', 'priorite', 'statut', 'livreur', 'actions'];
      } else {
        this.displayedColumns = ['id', 'description', 'destinataire', 'ville', 'poids', 'priorite', 'statut', 'actions'];
      }
    });

    // Load initial data
    this.loadColis();

    // Setup search debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(keyword => {
        if (keyword.trim()) {
          this.searchColis(keyword);
        } else {
          this.loadColis();
        }
      });

    // Can create colis if Manager or Client
    this.canCreateColis$ = this.store.select(state => {
      const isManager = selectIsManager(state);
      const isClient = selectIsClient(state);
      return isManager || isClient;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadColis() {
    this.store.dispatch(
      ColisActions.loadColis({
        pageRequest: {
          page: 0,
          size: this.pageSize,
          sort: 'dateCreation,desc'
        }
      })
    );
  }

  searchColis(keyword: string) {
    this.store.dispatch(
      ColisActions.searchColis({
        keyword,
        pageRequest: {
          page: 0,
          size: this.pageSize
        }
      })
    );
  }

  onSearchChange(keyword: string) {
    this.searchSubject.next(keyword);
  }

  onFilterChange(status: StatutColis | null) {
    this.store.dispatch(ColisActions.setStatusFilter({ status }));
  }

  onPageChange(event: PageEvent) {
    const pageRequest = {
      page: event.pageIndex,
      size: event.pageSize,
      sort: 'dateCreation,desc'
    };

    if (this.searchKeyword.trim()) {
      this.store.dispatch(
        ColisActions.searchColis({
          keyword: this.searchKeyword,
          pageRequest
        })
      );
    } else {
      this.store.dispatch(ColisActions.loadColis({ pageRequest }));
    }
  }

  updateStatus(colis: Colis, newStatus: string) {
    this.store.dispatch(
      ColisActions.updateStatus({
        id: colis.id!,
        statut: newStatus as StatutColis
      })
    );
  }

  deleteColis(colis: Colis) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce colis?')) {
      this.store.dispatch(ColisActions.deleteColis({ id: colis.id! }));
    }
  }

  openAssignDialog(colis: Colis) {
    this.livreurService.getActive().subscribe({
      next: (livreurs) => {
        const selectedLivreur = prompt(
          `Assigner ce colis à:\n${livreurs.map((l, i) => `${i + 1}. ${l.prenom} ${l.nom}`).join('\n')}\n\nEntrez le numéro:`
        );

        if (selectedLivreur) {
          const index = parseInt(selectedLivreur) - 1;
          if (index >= 0 && index < livreurs.length) {
            this.store.dispatch(
              ColisActions.assignLivreur({
                colisId: colis.id!,
                livreurId: livreurs[index].id!
              })
            );
          }
        }
      },
      error: (error) => {
        console.error('Error loading livreurs:', error);
        alert('Erreur lors du chargement des livreurs');
      }
    });
  }

  copyTrackingId(id: string | undefined) {
    if (!id) return;

    navigator.clipboard.writeText(id).then(
      () => alert('Numéro de suivi copié!'),
      () => alert('Erreur lors de la copie')
    );
  }

  getTitle(): Observable<string> {
    return this.store.select(state => {
      if (selectIsManager(state)) return 'Liste des Colis';
      if (selectIsLivreur(state)) return 'Mes Livraisons';
      if (selectIsClient(state)) return 'Mes Envois';
      return 'Colis';
    });
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
