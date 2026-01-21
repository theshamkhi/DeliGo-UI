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
import { ProduitService } from '../../../core/services/produit.service';
import { Produit } from '../../../core/models/produit.model';

@Component({
  selector: 'app-produit-form',
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
    <div class="produit-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>{{ isEditMode() ? 'Modifier' : 'Nouveau' }} Produit</h2>
              <button mat-icon-button routerLink="/produits">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <form *ngIf="!loading()" [formGroup]="produitForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Référence</mat-label>
              <input matInput formControlName="reference" placeholder="REF-001">
              <mat-icon matSuffix>tag</mat-icon>
              <mat-error *ngIf="produitForm.get('reference')?.hasError('required')">
                La référence est requise
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom du produit</mat-label>
              <input matInput formControlName="nom" placeholder="Nom du produit">
              <mat-icon matSuffix>category</mat-icon>
              <mat-error *ngIf="produitForm.get('nom')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput
                        formControlName="description"
                        placeholder="Description du produit"
                        rows="4"></textarea>
              <mat-icon matSuffix>description</mat-icon>
              <mat-error *ngIf="produitForm.get('description')?.hasError('required')">
                La description est requise
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Prix unitaire (MAD)</mat-label>
                <input matInput
                       type="number"
                       formControlName="prixUnitaire"
                       placeholder="0.00"
                       step="0.01">
                <mat-icon matSuffix>attach_money</mat-icon>
                <mat-error *ngIf="produitForm.get('prixUnitaire')?.hasError('required')">
                  Le prix est requis
                </mat-error>
                <mat-error *ngIf="produitForm.get('prixUnitaire')?.hasError('min')">
                  Le prix doit être positif
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Stock</mat-label>
                <input matInput
                       type="number"
                       formControlName="stock"
                       placeholder="0">
                <mat-icon matSuffix>inventory</mat-icon>
                <mat-error *ngIf="produitForm.get('stock')?.hasError('required')">
                  Le stock est requis
                </mat-error>
                <mat-error *ngIf="produitForm.get('stock')?.hasError('min')">
                  Le stock doit être positif ou zéro
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button type="button" routerLink="/produits">
                <mat-icon>cancel</mat-icon>
                Annuler
              </button>
              <button mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="produitForm.invalid || saving()">
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
    .produit-form-container {
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
export class ProduitFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private produitService = inject(ProduitService);

  produitForm: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  produitId: string | null = null;

  constructor() {
    this.produitForm = this.fb.group({
      reference: ['', Validators.required],
      nom: ['', Validators.required],
      description: ['', Validators.required],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.produitId = this.route.snapshot.paramMap.get('id');
    if (this.produitId) {
      this.isEditMode.set(true);
      this.loadProduit(this.produitId);
    }
  }

  loadProduit(id: string) {
    this.loading.set(true);
    this.produitService.getById(id).subscribe({
      next: (produit) => {
        this.produitForm.patchValue(produit);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading produit:', error);
        alert('Erreur lors du chargement du produit');
        this.router.navigate(['/produits']);
      }
    });
  }

  onSubmit() {
    if (this.produitForm.invalid) {
      return;
    }

    this.saving.set(true);
    const data: Produit = this.produitForm.value;

    const operation = this.isEditMode() && this.produitId
      ? this.produitService.update(this.produitId, data)
      : this.produitService.create(data);

    operation.subscribe({
      next: () => {
        alert(`Produit ${this.isEditMode() ? 'mis à jour' : 'créé'} avec succès!`);
        this.router.navigate(['/produits']);
      },
      error: (error) => {
        console.error('Error saving produit:', error);
        alert('Erreur lors de l\'enregistrement du produit');
        this.saving.set(false);
      }
    });
  }
}
