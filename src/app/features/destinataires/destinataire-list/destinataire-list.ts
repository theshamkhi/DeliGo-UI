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
import { DestinataireService } from '../../../core/services/destinataire.service';
import { AuthService } from '../../../core/services/auth.service';
import { Destinataire } from '../../../core/models/destinataire.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-destinataire-list',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="destinataire-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>{{ getTitle() }}</h2>
              <button mat-raised-button color="primary" routerLink="/destinataires/new">
                <mat-icon>add</mat-icon>
                Nouveau Destinataire
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-form-field class="search-field" appearance="outline">
            <mat-label>Rechercher un destinataire</mat-label>
            <input matInput
                   [(ngModel)]="searchKeyword"
                   (ngModelChange)="onSearchChange($event)"
                   placeholder="Nom, prénom, email, téléphone...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading()" class="table-container">
            <table mat-table [dataSource]="destinataires()" class="mat-elevation-z2">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let dest">{{ dest.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="prenom">
                <th mat-header-cell *matHeaderCellDef>Prénom</th>
                <td mat-cell *matCellDef="let dest">{{ dest.prenom }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let dest">{{ dest.email }}</td>
              </ng-container>

              <ng-container matColumnDef="telephone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let dest">{{ dest.telephone }}</td>
              </ng-container>

              <ng-container matColumnDef="adresse">
                <th mat-header-cell *matHeaderCellDef>Adresse</th>
                <td mat-cell *matCellDef="let dest">{{ dest.adresse }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let dest">
                  <button mat-icon-button
                          [routerLink]="['/destinataires', dest.id]"
                          matTooltip="Voir détails"
                          color="primary">
                    <mat-icon>visibility</mat-icon>
                  </button>

                  <!-- ✅ Manager can edit/delete all -->
                  <button *ngIf="isManager()"
                          mat-icon-button
                          [routerLink]="['/destinataires', dest.id, 'edit']"
                          matTooltip="Modifier"
                          color="accent">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button *ngIf="isManager()"
                          mat-icon-button
                          (click)="deleteDestinataire(dest)"
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
                    <p>Aucun destinataire trouvé</p>
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
    .destinataire-list-container {
      padding: 20px;
      max-width: 1400px;
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

    .search-field {
      width: 100%;
      margin-bottom: 20px;
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
  `]
})
export class DestinataireListComponent implements OnInit {
  private destinataireService = inject(DestinataireService);
  private authService = inject(AuthService);

  destinataires = signal<Destinataire[]>([]);
  pageResponse = signal<PageResponse<Destinataire> | null>(null);
  loading = signal(false);

  displayedColumns: string[] = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'actions'];
  currentPage = 0;
  pageSize = 20;
  searchKeyword = '';

  private searchSubject = new Subject<string>();

  // ✅ Role checks
  isManager = computed(() => this.authService.hasRole('ROLE_MANAGER'));
  isClient = computed(() => this.authService.hasRole('ROLE_CLIENT'));

  ngOnInit() {
    this.loadDestinataires();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(keyword => {
      this.currentPage = 0;
      if (keyword.trim()) {
        this.searchDestinataires(keyword);
      } else {
        this.loadDestinataires();
      }
    });
  }

  /**
   * ✅ Load destinataires with role-based filtering
   * Backend automatically filters:
   * - Manager: All destinataires
   * - Client: Only their own destinataires
   */
  loadDestinataires() {
    this.loading.set(true);
    this.destinataireService.getAll({
      page: this.currentPage,
      size: this.pageSize,
      sort: 'nom,asc'
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.destinataires.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading destinataires:', error);
        this.loading.set(false);
      }
    });
  }

  searchDestinataires(keyword: string) {
    this.loading.set(true);
    this.destinataireService.search(keyword, {
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.destinataires.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching destinataires:', error);
        this.loading.set(false);
      }
    });
  }

  onSearchChange(keyword: string) {
    this.searchSubject.next(keyword);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.searchKeyword.trim()) {
      this.searchDestinataires(this.searchKeyword);
    } else {
      this.loadDestinataires();
    }
  }

  /**
   * ✅ Only managers can delete
   */
  deleteDestinataire(dest: Destinataire) {
    if (!this.isManager()) {
      alert('Vous n\'avez pas la permission de supprimer');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${dest.prenom} ${dest.nom}?`)) {
      this.destinataireService.delete(dest.id!).subscribe({
        next: () => {
          this.loadDestinataires();
        },
        error: (error) => {
          console.error('Error deleting destinataire:', error);
          alert('Erreur lors de la suppression du destinataire');
        }
      });
    }
  }

  /**
   * ✅ Title based on role
   */
  getTitle(): string {
    return this.isClient() ? 'Mes Destinataires' : 'Liste des Destinataires';
  }
}
