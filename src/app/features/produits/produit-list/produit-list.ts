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
import { ProduitService } from '../../../core/services/produit.service';
import { AuthService } from '../../../core/services/auth.service';
import { Produit } from '../../../core/models/produit.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-produit-list',
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
    MatChipsModule
  ],
  template: `
    <div class="produit-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>Catalogue Produits</h2>
              <button *ngIf="isManager()"
                      mat-raised-button
                      color="primary"
                      routerLink="/produits/new">
                <mat-icon>add</mat-icon>
                Nouveau Produit
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-form-field class="search-field" appearance="outline">
            <mat-label>Rechercher un produit</mat-label>
            <input matInput
                   [(ngModel)]="searchKeyword"
                   (ngModelChange)="onSearchChange($event)"
                   placeholder="Nom, référence...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading()" class="table-container">
            <table mat-table [dataSource]="produits()" class="mat-elevation-z2">
              <ng-container matColumnDef="reference">
                <th mat-header-cell *matHeaderCellDef>Référence</th>
                <td mat-cell *matCellDef="let prod">{{ prod.reference }}</td>
              </ng-container>

              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let prod">{{ prod.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let prod">{{ prod.description }}</td>
              </ng-container>

              <ng-container matColumnDef="prixUnitaire">
                <th mat-header-cell *matHeaderCellDef>Prix</th>
                <td mat-cell *matCellDef="let prod">{{ prod.prixUnitaire | currency:'MAD' }}</td>
              </ng-container>

              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let prod">
                  <mat-chip [class.low-stock]="prod.stock < 10" [class.normal-stock]="prod.stock >= 10">
                    {{ prod.stock }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let prod">
                  <button mat-icon-button
                          [routerLink]="['/produits', prod.id]"
                          matTooltip="Voir détails"
                          color="primary">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <!-- Manager-only actions -->
                  <button *ngIf="isManager()"
                          mat-icon-button
                          [routerLink]="['/produits', prod.id, 'edit']"
                          matTooltip="Modifier"
                          color="accent">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button *ngIf="isManager()"
                          mat-icon-button
                          (click)="deleteProduit(prod)"
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
                    <p>Aucun produit trouvé</p>
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
    .produit-list-container {
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

    .low-stock {
      background-color: #F44336 !important;
      color: white !important;
    }

    .normal-stock {
      background-color: #4CAF50 !important;
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
  `]
})
export class ProduitListComponent implements OnInit {
  private produitService = inject(ProduitService);
  private authService = inject(AuthService);

  produits = signal<Produit[]>([]);
  pageResponse = signal<PageResponse<Produit> | null>(null);
  loading = signal(false);

  // Computed: Show actions column only if manager
  displayedColumns = computed(() => {
    const base = ['reference', 'nom', 'description', 'prixUnitaire', 'stock'];
    return this.isManager() ? [...base, 'actions'] : base;
  });

  currentPage = 0;
  pageSize = 20;
  searchKeyword = '';

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadProduits();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(keyword => {
      this.currentPage = 0;
      if (keyword.trim()) {
        this.searchProduits(keyword);
      } else {
        this.loadProduits();
      }
    });
  }

  isManager(): boolean {
    return this.authService.hasRole('ROLE_MANAGER');
  }

  loadProduits() {
    this.loading.set(true);
    this.produitService.getAll({
      page: this.currentPage,
      size: this.pageSize,
      sort: 'nom,asc'
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.produits.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading produits:', error);
        this.loading.set(false);
      }
    });
  }

  searchProduits(keyword: string) {
    this.loading.set(true);
    this.produitService.search(keyword, {
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.produits.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching produits:', error);
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
      this.searchProduits(this.searchKeyword);
    } else {
      this.loadProduits();
    }
  }

  deleteProduit(prod: Produit) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${prod.nom}?`)) {
      this.produitService.delete(prod.id!).subscribe({
        next: () => {
          this.loadProduits();
        },
        error: (error) => {
          console.error('Error deleting produit:', error);
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }
}
