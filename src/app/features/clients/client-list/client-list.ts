import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { Client } from '../../../core/models/client.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-client-list',
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
    <div class="client-list-container">
      <!-- Access Denied Message -->
      <mat-card *ngIf="!isManager()">
        <mat-card-content class="access-denied">
          <mat-icon>lock</mat-icon>
          <h2>Accès Refusé</h2>
          <p>Vous n'avez pas l'autorisation d'accéder à cette page.</p>
          <button mat-raised-button color="primary" routerLink="/dashboard">
            Retour au tableau de bord
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Main Content (Only for Managers) -->
      <mat-card *ngIf="isManager()">
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>Liste des Clients</h2>
              <button mat-raised-button color="primary" routerLink="/clients/new">
                <mat-icon>add</mat-icon>
                Nouveau Client
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-form-field class="search-field" appearance="outline">
            <mat-label>Rechercher un client</mat-label>
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
            <table mat-table [dataSource]="clients()" class="mat-elevation-z2">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let client">{{ client.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="prenom">
                <th mat-header-cell *matHeaderCellDef>Prénom</th>
                <td mat-cell *matCellDef="let client">{{ client.prenom }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let client">{{ client.email }}</td>
              </ng-container>

              <ng-container matColumnDef="telephone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let client">{{ client.telephone }}</td>
              </ng-container>

              <ng-container matColumnDef="adresse">
                <th mat-header-cell *matHeaderCellDef>Adresse</th>
                <td mat-cell *matCellDef="let client">{{ client.adresse }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let client">
                  <button mat-icon-button
                          [routerLink]="['/clients', client.id]"
                          matTooltip="Voir détails"
                          color="primary">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button
                          [routerLink]="['/clients', client.id, 'edit']"
                          matTooltip="Modifier"
                          color="accent">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="deleteClient(client)"
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
                    <p>Aucun client trouvé</p>
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
    .client-list-container {
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

    mat-card-header {
      margin-bottom: 16px;
    }
  `]
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private router = inject(Router);

  clients = signal<Client[]>([]);
  pageResponse = signal<PageResponse<Client> | null>(null);
  loading = signal(false);

  displayedColumns: string[] = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'actions'];
  currentPage = 0;
  pageSize = 20;
  searchKeyword = '';

  private searchSubject = new Subject<string>();

  ngOnInit() {
    // Check authorization
    if (!this.isManager()) {
      return; // Component will show access denied message
    }

    this.loadClients();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(keyword => {
      this.currentPage = 0;
      if (keyword.trim()) {
        this.searchClients(keyword);
      } else {
        this.loadClients();
      }
    });
  }

  isManager(): boolean {
    return this.authService.hasRole('ROLE_MANAGER');
  }

  loadClients() {
    this.loading.set(true);
    this.clientService.getAll({
      page: this.currentPage,
      size: this.pageSize,
      sort: 'nom,asc'
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.clients.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.loading.set(false);
      }
    });
  }

  searchClients(keyword: string) {
    this.loading.set(true);
    this.clientService.search(keyword, {
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.clients.set(response.content);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching clients:', error);
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
      this.searchClients(this.searchKeyword);
    } else {
      this.loadClients();
    }
  }

  deleteClient(client: Client) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le client ${client.prenom} ${client.nom}?`)) {
      this.clientService.delete(client.id!).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          alert('Erreur lors de la suppression du client');
        }
      });
    }
  }
}
