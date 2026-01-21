import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LivreurService } from '../../../core/services/livreur.service';
import { ZoneService } from '../../../core/services/zone.service';
import { Livreur } from '../../../core/models/livreur.model';
import { Zone } from '../../../core/models/zone.model';

@Component({
  selector: 'app-livreur-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="livreur-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>{{ isEditMode() ? 'Modifier' : 'Nouveau' }} Livreur</h2>
              <button mat-icon-button routerLink="/livreurs" matTooltip="Retour">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <form *ngIf="!loading()" [formGroup]="livreurForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom" placeholder="Entrez le nom">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="livreurForm.get('nom')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="prenom" placeholder="Entrez le prénom">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="livreurForm.get('prenom')?.hasError('required')">
                  Le prénom est requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="telephone" placeholder="06XXXXXXXX">
                <mat-icon matSuffix>phone</mat-icon>
                <mat-error *ngIf="livreurForm.get('telephone')?.hasError('required')">
                  Le téléphone est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Véhicule</mat-label>
                <input matInput formControlName="vehicule" placeholder="ex: Moto Yamaha 125cc">
                <mat-icon matSuffix>two_wheeler</mat-icon>
                <mat-error *ngIf="livreurForm.get('vehicule')?.hasError('required')">
                  Le véhicule est requis
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Zone Assignée</mat-label>
              <mat-select formControlName="zoneAssigneeId">
                <mat-option *ngFor="let zone of zones()" [value]="zone.id">
                  {{ zone.nom }} - {{ zone.codePostal }}
                </mat-option>
              </mat-select>
              <mat-icon matSuffix>map</mat-icon>
              <mat-error *ngIf="livreurForm.get('zoneAssigneeId')?.hasError('required')">
                La zone est requise
              </mat-error>
            </mat-form-field>

            <div class="toggle-field">
              <mat-slide-toggle formControlName="actif" color="primary">
                Livreur actif
              </mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button mat-raised-button type="button" routerLink="/livreurs">
                <mat-icon>cancel</mat-icon>
                Annuler
              </button>
              <button mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="livreurForm.invalid || saving()">
                <mat-spinner *ngIf="saving()" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!saving()">save</mat-icon>
                {{ isEditMode() ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .livreur-form-container {
      padding: 20px;
      max-width: 900px;
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

    form {
      padding: 20px 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-field {
      width: 100%;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .toggle-field {
      margin-bottom: 32px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
    }

    .form-actions button {
      min-width: 120px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LivreurFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private livreurService = inject(LivreurService);
  private zoneService = inject(ZoneService);

  livreurForm: FormGroup;
  zones = signal<Zone[]>([]);
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  livreurId: string | null = null;

  constructor() {
    this.livreurForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      vehicule: ['', Validators.required],
      zoneAssigneeId: ['', Validators.required],
      actif: [true]
    });
  }

  ngOnInit() {
    this.loadZones();
    this.livreurId = this.route.snapshot.paramMap.get('id');
    if (this.livreurId) {
      this.isEditMode.set(true);
      this.loadLivreur(this.livreurId);
    }
  }

  loadZones() {
    this.zoneService.getAll({ page: 0, size: 100, sort: 'nom,asc' }).subscribe({
      next: (response) => {
        this.zones.set(response.content);
      },
      error: (error) => {
        console.error('Error loading zones:', error);
      }
    });
  }

  loadLivreur(id: string) {
    this.loading.set(true);
    this.livreurService.getById(id).subscribe({
      next: (livreur) => {
        this.livreurForm.patchValue(livreur);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading livreur:', error);
        alert('Erreur lors du chargement du livreur');
        this.router.navigate(['/livreurs']);
      }
    });
  }

  onSubmit() {
    if (this.livreurForm.invalid) {
      return;
    }

    this.saving.set(true);
    const data: Livreur = this.livreurForm.value;

    const operation = this.isEditMode() && this.livreurId
      ? this.livreurService.update(this.livreurId, data)
      : this.livreurService.create(data);

    operation.subscribe({
      next: () => {
        alert(`Livreur ${this.isEditMode() ? 'mis à jour' : 'créé'} avec succès!`);
        this.router.navigate(['/livreurs']);
      },
      error: (error) => {
        console.error('Error saving livreur:', error);
        alert('Erreur lors de l\'enregistrement du livreur');
        this.saving.set(false);
      }
    });
  }
}
