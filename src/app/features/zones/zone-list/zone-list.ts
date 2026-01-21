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
import { ZoneService } from '../../../core/services/zone.service';
import { AuthService } from '../../../core/services/auth.service';
import { Zone } from '../../../core/models/zone.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-zone-list',
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
    <div class="zone-list-container">
      <mat-card *ngIf="!isManager()">
        <mat-card-content class="access-denied">
          <mat-icon>lock</mat-icon>
          <h2>Accès Refusé</h2>
          <p>Seuls les gestionnaires peuvent accéder à la gestion des zones.</p>
          <button mat-raised-button color="primary" routerLink="/dashboard">
            Retour au tableau de bord
          </button>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="isManager()">
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>Zones de Livraison</h2>
              <button mat-raised-button color="primary" routerLink="/zones/new">
                <mat-icon>add</mat-icon>
                Nouvelle Zone
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-form-field class="search-field" appearance="outline">
            <mat-label>Rechercher une zone</mat-label>
            <input matInput
                   [(ngModel)]="searchKeyword"
                   (ngModelChange)="onSearchChange($event)"
                   placeholder="Nom, code postal, ville...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading()" class="table-container">
            <table mat-table [dataSource]="zones()" class="mat-elevation-z2">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let zone">{{ zone.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="ville">
                <th mat-header-cell *matHeaderCellDef>Ville</th>
                <td mat-cell *matCellDef="let zone">{{ zone.ville }}</td>
              </ng-container>

              <ng-container matColumnDef="codePostal">
                <th mat-header-cell *matHeaderCellDef>Code Postal</th>
                <td mat-cell *matCellDef="let zone">{{ zone.codePostal }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let zone">
                  <button mat-icon-button
                          [routerLink]="['/zones', zone.id]"
                          matTooltip="Voir détails"
                          color="primary">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button
                          [routerLink]="['/zones', zone.id, 'edit']"
                          matTooltip="Modifier"
                          color="accent">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="deleteZone(zone)"
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
                    <p>Aucune zone trouvée</p>
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
    .zone-list-container {
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

    .no-data p {
      margin: 0;
      font-size: 16px;
    }

    mat-card {
      margin-bottom: 20px;
    }
  `]
})
export class ZoneListComponent implements OnInit {
  private zoneService = inject(ZoneService);
  private authService = inject(AuthService);

  zones = signal<Zone[]>([]);
  pageResponse = signal<PageResponse<Zone> | null>(null);
  loading = signal(false);

  displayedColumns: string[] = ['nom', 'ville', 'codePostal', 'actions'];
  currentPage = 0;
  pageSize = 20;
  searchKeyword = '';

  private searchSubject = new Subject<string>();

  ngOnInit() {
    if (!this.isManager()) {
      return;
    }

    this.loadZones();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(keyword => {
      this.currentPage = 0;
      if (keyword.trim()) {
        this.searchZones(keyword);
      } else {
        this.loadZones();
      }
    });
  }

  /**
   *   Check if user is manager
   */
  isManager(): boolean {
    return this.authService.hasRole('ROLE_MANAGER');
  }

  loadZones() {
    this.loading.set(true);
    this.zoneService.getAll({
      page: this.currentPage,
      size: this.pageSize,
      sort: 'nom,asc'
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.zones.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading zones:', error);
        this.loading.set(false);
      }
    });
  }

  searchZones(keyword: string) {
    this.loading.set(true);
    this.zoneService.search(keyword, {
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.zones.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching zones:', error);
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
      this.searchZones(this.searchKeyword);
    } else {
      this.loadZones();
    }
  }

  deleteZone(zone: Zone) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la zone ${zone.nom}?`)) {
      this.zoneService.delete(zone.id!).subscribe({
        next: () => {
          this.loadZones();
        },
        error: (error) => {
          console.error('Error deleting zone:', error);
          alert('Erreur lors de la suppression de la zone');
        }
      });
    }
  }
}
