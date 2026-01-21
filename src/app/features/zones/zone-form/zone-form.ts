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
import { ZoneService } from '../../../core/services/zone.service';
import { Zone } from '../../../core/models/zone.model';

@Component({
  selector: 'app-zone-form',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="zone-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>{{ isEditMode() ? 'Modifier' : 'Nouvelle' }} Zone</h2>
              <button mat-icon-button routerLink="/zones">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <form *ngIf="!loading()" [formGroup]="zoneForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom de la zone</mat-label>
              <input matInput formControlName="nom" placeholder="Casablanca Centre">
              <mat-icon matSuffix>location_city</mat-icon>
              <mat-error *ngIf="zoneForm.get('nom')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Code Postal</mat-label>
              <input matInput formControlName="codePostal" placeholder="20000">
              <mat-icon matSuffix>pin</mat-icon>
              <mat-error *ngIf="zoneForm.get('codePostal')?.hasError('required')">
                Le code postal est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Ville</mat-label>
              <input matInput formControlName="ville" placeholder="Casablanca">
              <mat-icon matSuffix>location_city</mat-icon>
              <mat-error *ngIf="zoneForm.get('ville')?.hasError('required')">
                La ville est requise
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button type="button" routerLink="/zones">
                <mat-icon>cancel</mat-icon>
                Annuler
              </button>
              <button mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="zoneForm.invalid || saving()">
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
    .zone-form-container {
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

    .full-width {
      width: 100%;
      margin-bottom: 20px;
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
  `]
})
export class ZoneFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private zoneService = inject(ZoneService);

  zoneForm: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  zoneId: string | null = null;

  constructor() {
    this.zoneForm = this.fb.group({
      nom: ['', Validators.required],
      codePostal: ['', Validators.required],
      ville: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.zoneId = this.route.snapshot.paramMap.get('id');
    if (this.zoneId) {
      this.isEditMode.set(true);
      this.loadZone(this.zoneId);
    }
  }

  loadZone(id: string) {
    this.loading.set(true);
    this.zoneService.getById(id).subscribe({
      next: (zone) => {
        this.zoneForm.patchValue(zone);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading zone:', error);
        alert('Erreur lors du chargement de la zone');
        this.router.navigate(['/zones']);
      }
    });
  }

  onSubmit() {
    if (this.zoneForm.invalid) {
      return;
    }

    this.saving.set(true);
    const data: Zone = this.zoneForm.value;

    const operation = this.isEditMode() && this.zoneId
      ? this.zoneService.update(this.zoneId, data)
      : this.zoneService.create(data);

    operation.subscribe({
      next: () => {
        alert(`Zone ${this.isEditMode() ? 'mise à jour' : 'créée'} avec succès!`);
        this.router.navigate(['/zones']);
      },
      error: (error) => {
        console.error('Error saving zone:', error);
        alert('Erreur lors de l\'enregistrement de la zone');
        this.saving.set(false);
      }
    });
  }
}
