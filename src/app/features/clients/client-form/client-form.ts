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
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-form',
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
    <div class="client-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>{{ isEditMode() ? 'Modifier' : 'Nouveau' }} Client</h2>
              <button mat-icon-button routerLink="/clients" matTooltip="Retour">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <form *ngIf="!loading()" [formGroup]="clientForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom" placeholder="Entrez le nom">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="clientForm.get('nom')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="prenom" placeholder="Entrez le prénom">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="clientForm.get('prenom')?.hasError('required')">
                  Le prénom est requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="exemple@email.com">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="clientForm.get('email')?.hasError('required')">
                  L'email est requis
                </mat-error>
                <mat-error *ngIf="clientForm.get('email')?.hasError('email')">
                  Email invalide
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="telephone" placeholder="06XXXXXXXX">
                <mat-icon matSuffix>phone</mat-icon>
                <mat-error *ngIf="clientForm.get('telephone')?.hasError('required')">
                  Le téléphone est requis
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse</mat-label>
              <textarea matInput
                        formControlName="adresse"
                        placeholder="Entrez l'adresse complète"
                        rows="3"></textarea>
              <mat-icon matSuffix>location_on</mat-icon>
              <mat-error *ngIf="clientForm.get('adresse')?.hasError('required')">
                L'adresse est requise
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button type="button" routerLink="/clients">
                <mat-icon>cancel</mat-icon>
                Annuler
              </button>
              <button mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="clientForm.invalid || saving()">
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
    .client-form-container {
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

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);

  clientForm: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  clientId: string | null = null;

  constructor() {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId) {
      this.isEditMode.set(true);
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: string) {
    this.loading.set(true);
    this.clientService.getById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue(client);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading client:', error);
        alert('Erreur lors du chargement du client');
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit() {
    if (this.clientForm.invalid) {
      return;
    }

    this.saving.set(true);
    const clientData: Client = this.clientForm.value;

    console.log('Submitting client data:', clientData);
    console.log('Is edit mode:', this.isEditMode());
    console.log('Client ID:', this.clientId);

    const operation = this.isEditMode() && this.clientId
      ? this.clientService.update(this.clientId, clientData)
      : this.clientService.create(clientData);

    operation.subscribe({
      next: (response) => {
        console.log('Success response:', response);
        alert(`Client ${this.isEditMode() ? 'mis à jour' : 'créé'} avec succès!`);
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        // Log everything
        console.error('Full error object:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error error:', error.error);

        // Build better error message
        let errorMessage = 'Erreur lors de l\'enregistrement du client';

        if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        } else if (error.status === 401) {
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          errorMessage = 'Accès refusé. Permissions insuffisantes.';
        } else if (error.status === 400) {
          errorMessage = 'Données invalides: ' + (error.error?.message || 'Vérifiez les champs du formulaire');
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur: ' + (error.error?.message || 'Contactez l\'administrateur');
        } else if (error.message) {
          errorMessage = error.message;
        }

        alert(errorMessage);
        this.saving.set(false);
      }
    });
  }
}
