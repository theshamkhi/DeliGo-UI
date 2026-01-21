import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ColisService } from '../../../core/services/colis.service';
import { ClientService } from '../../../core/services/client.service';
import { DestinataireService } from '../../../core/services/destinataire.service';
import { AuthService } from '../../../core/services/auth.service';
import { Colis, PrioriteColis } from '../../../core/models/colis.model';
import { Client } from '../../../core/models/client.model';
import { Destinataire } from '../../../core/models/destinataire.model';

@Component({
  selector: 'app-colis-form',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="colis-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h2>{{ isEditMode() ? 'Modifier' : isClient() ? 'Nouvelle Demande' : 'Nouveau Colis' }}</h2>
              <button mat-icon-button routerLink="/colis" matTooltip="Retour">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading()" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <form *ngIf="!loading()" [formGroup]="colisForm" (ngSubmit)="onSubmit()">
            <h3 class="section-title">Informations du Colis</h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput
                        formControlName="description"
                        placeholder="Description du colis"
                        rows="3"></textarea>
              <mat-icon matSuffix>description</mat-icon>
              <mat-error *ngIf="colisForm.get('description')?.hasError('required')">
                La description est requise
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Poids (kg)</mat-label>
                <input matInput type="number" formControlName="poids" placeholder="0.0" step="0.1">
                <mat-icon matSuffix>scale</mat-icon>
                <mat-error *ngIf="colisForm.get('poids')?.hasError('required')">
                  Le poids est requis
                </mat-error>
                <mat-error *ngIf="colisForm.get('poids')?.hasError('min')">
                  Le poids doit être positif
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Priorité</mat-label>
                <mat-select formControlName="priorite">
                  <mat-option value="BASSE">Basse</mat-option>
                  <mat-option value="NORMALE">Normale</mat-option>
                  <mat-option value="HAUTE">Haute</mat-option>
                  <mat-option value="URGENTE">Urgente</mat-option>
                </mat-select>
                <mat-icon matSuffix>priority_high</mat-icon>
                <mat-error *ngIf="colisForm.get('priorite')?.hasError('required')">
                  La priorité est requise
                </mat-error>
              </mat-form-field>
            </div>

            <h3 class="section-title">Expéditeur et Destinataire</h3>

            <div class="form-row">
              <!-- ✅ CLIENT ROLE: Auto-filled and disabled -->
              <mat-form-field *ngIf="isClient()" appearance="outline" class="form-field">
                <mat-label>Client Expéditeur</mat-label>
                <input matInput [value]="getCurrentUserName()" disabled>
                <mat-icon matSuffix>person</mat-icon>
                <mat-hint>Vous êtes l'expéditeur</mat-hint>
              </mat-form-field>

              <!-- ✅ MANAGER ROLE: Dropdown selection -->
              <mat-form-field *ngIf="isManager()" appearance="outline" class="form-field">
                <mat-label>Client Expéditeur</mat-label>
                <mat-select formControlName="clientExpediteurId">
                  <mat-option *ngFor="let client of clients()" [value]="client.id">
                    {{ client.prenom }} {{ client.nom }} - {{ client.telephone }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="colisForm.get('clientExpediteurId')?.hasError('required')">
                  L'expéditeur est requis
                </mat-error>
              </mat-form-field>

              <!-- ✅ DESTINATAIRE: All roles can select -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Destinataire</mat-label>
                <mat-select formControlName="destinataireId">
                  <mat-option *ngFor="let dest of destinataires()" [value]="dest.id">
                    {{ dest.prenom }} {{ dest.nom }} - {{ dest.telephone }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>contact_mail</mat-icon>
                <mat-error *ngIf="colisForm.get('destinataireId')?.hasError('required')">
                  Le destinataire est requis
                </mat-error>
              </mat-form-field>
            </div>

            <!-- ✅ Add Destinataire Button -->
            <div class="add-destinataire-hint">
              <mat-icon>info</mat-icon>
              <span>Destinataire manquant? </span>
              <a routerLink="/destinataires/new" target="_blank">Créer un nouveau destinataire</a>
            </div>

            <h3 class="section-title">Destination</h3>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Ville de Destination</mat-label>
                <input matInput formControlName="villeDestination" placeholder="Casablanca">
                <mat-icon matSuffix>location_city</mat-icon>
                <mat-error *ngIf="colisForm.get('villeDestination')?.hasError('required')">
                  La ville de destination est requise
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Date Limite de Livraison</mat-label>
                <input matInput
                       [matDatepicker]="picker"
                       formControlName="dateLimiteLivraison"
                       placeholder="JJ/MM/AAAA">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button type="button" routerLink="/colis">
                <mat-icon>cancel</mat-icon>
                Annuler
              </button>
              <button mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="colisForm.invalid || saving()">
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
    .colis-form-container {
      padding: 20px;
      max-width: 1000px;
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

    .section-title {
      margin: 32px 0 16px 0;
      font-size: 18px;
      font-weight: 500;
      color: #1976d2;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 8px;
    }

    .section-title:first-of-type {
      margin-top: 0;
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

    .add-destinataire-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      margin-bottom: 20px;
      background: #e3f2fd;
      border-radius: 4px;
      font-size: 14px;
    }

    .add-destinataire-hint mat-icon {
      color: #1976d2;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .add-destinataire-hint a {
      color: #1976d2;
      font-weight: 500;
      text-decoration: none;
    }

    .add-destinataire-hint a:hover {
      text-decoration: underline;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
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
export class ColisFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private colisService = inject(ColisService);
  private clientService = inject(ClientService);
  private destinataireService = inject(DestinataireService);
  private authService = inject(AuthService);

  colisForm: FormGroup;
  clients = signal<Client[]>([]);
  destinataires = signal<Destinataire[]>([]);
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  colisId: string | null = null;

  // Role checks
  isManager = computed(() => this.authService.hasRole('ROLE_MANAGER'));
  isClient = computed(() => this.authService.hasRole('ROLE_CLIENT'));

  constructor() {
    this.colisForm = this.fb.group({
      description: ['', Validators.required],
      poids: [0, [Validators.required, Validators.min(0.1)]],
      priorite: ['NORMALE', Validators.required],
      clientExpediteurId: ['', Validators.required],
      destinataireId: ['', Validators.required],
      villeDestination: ['', Validators.required],
      dateLimiteLivraison: ['']
    });
  }

  ngOnInit() {
    if (this.isManager()) {
      this.loadClients();
    } else if (this.isClient()) {
      this.autoFillClientExpediteur();
    }

    this.loadDestinataires();

    this.colisId = this.route.snapshot.paramMap.get('id');
    if (this.colisId) {
      this.isEditMode.set(true);
      this.loadColis(this.colisId);
    }
  }

  autoFillClientExpediteur() {
    const currentUser = this.authService.currentUser();
    if (currentUser?.id) {
      this.colisForm.patchValue({
        clientExpediteurId: currentUser.id
      });
    }
  }

  getCurrentUserName(): string {
    const user = this.authService.currentUser();
    return user ? `${user.prenom} ${user.nom}` : 'Vous';
  }

  loadClients() {
    this.clientService.getAll({ page: 0, size: 100, sort: 'nom,asc' }).subscribe({
      next: (response) => {
        this.clients.set(response.content);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  loadDestinataires() {
    this.destinataireService.getAll({ page: 0, size: 100, sort: 'nom,asc' }).subscribe({
      next: (response) => {
        this.destinataires.set(response.content);
      },
      error: (error) => {
        console.error('Error loading destinataires:', error);
      }
    });
  }

  loadColis(id: string) {
    this.loading.set(true);
    this.colisService.getById(id).subscribe({
      next: (colis) => {
        this.colisForm.patchValue(colis);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading colis:', error);
        alert('Erreur lors du chargement du colis');
        this.router.navigate(['/colis']);
      }
    });
  }

  onSubmit() {
    if (this.colisForm.invalid) {
      return;
    }

    this.saving.set(true);
    const data: Colis = this.colisForm.value;

    const operation = this.isEditMode() && this.colisId
      ? this.colisService.update(this.colisId, data)
      : this.colisService.create(data);

    operation.subscribe({
      next: () => {
        alert(`Colis ${this.isEditMode() ? 'mis à jour' : 'créé'} avec succès!`);
        this.router.navigate(['/colis']);
      },
      error: (error) => {
        console.error('Error saving colis:', error);
        alert('Erreur lors de l\'enregistrement du colis');
        this.saving.set(false);
      }
    });
  }
}
