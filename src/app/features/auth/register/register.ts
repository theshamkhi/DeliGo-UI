import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
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
    MatCheckboxModule,
    MatStepperModule
  ],
  template: `
    <div class="register-container">
      <div class="register-card-wrapper">
        <mat-card class="register-card">
          <mat-card-header>
            <div class="logo-section">
              <div class="logo">🚚</div>
              <h1>DeliGo</h1>
              <p class="subtitle">Créer un nouveau compte</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <mat-stepper #stepper [linear]="true" orientation="vertical">
              <!-- Step 1: Account Info -->
              <mat-step [stepControl]="accountForm">
                <form [formGroup]="accountForm">
                  <ng-template matStepLabel>Informations du compte</ng-template>

                  <div *ngIf="errorMessage()" class="error-message">
                    <mat-icon>error</mat-icon>
                    <span>{{ errorMessage() }}</span>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nom d'utilisateur</mat-label>
                    <input matInput
                           formControlName="username"
                           placeholder="Choisissez un nom d'utilisateur"
                           autocomplete="username">
                    <mat-icon matSuffix>person</mat-icon>
                    <mat-error *ngIf="accountForm.get('username')?.hasError('required')">
                      Le nom d'utilisateur est requis
                    </mat-error>
                    <mat-error *ngIf="accountForm.get('username')?.hasError('minlength')">
                      Minimum 3 caractères requis
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email</mat-label>
                    <input matInput
                           type="email"
                           formControlName="email"
                           placeholder="votre@email.com"
                           autocomplete="email">
                    <mat-icon matSuffix>email</mat-icon>
                    <mat-error *ngIf="accountForm.get('email')?.hasError('required')">
                      L'email est requis
                    </mat-error>
                    <mat-error *ngIf="accountForm.get('email')?.hasError('email')">
                      Email invalide
                    </mat-error>
                  </mat-form-field>

                  <div class="stepper-actions">
                    <button mat-raised-button color="primary" matStepperNext>
                      Suivant
                      <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 2: Password -->
              <mat-step [stepControl]="passwordForm">
                <form [formGroup]="passwordForm">
                  <ng-template matStepLabel>Mot de passe</ng-template>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Mot de passe</mat-label>
                    <input matInput
                           [type]="hidePassword() ? 'password' : 'text'"
                           formControlName="password"
                           placeholder="Entrez votre mot de passe"
                           autocomplete="new-password">
                    <button mat-icon-button
                            matSuffix
                            type="button"
                            (click)="togglePasswordVisibility()">
                      <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('password')?.hasError('required')">
                      Le mot de passe est requis
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('password')?.hasError('minlength')">
                      Minimum 6 caractères requis
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirmer le mot de passe</mat-label>
                    <input matInput
                           [type]="hidePassword() ? 'password' : 'text'"
                           formControlName="confirmPassword"
                           placeholder="Confirmez votre mot de passe"
                           autocomplete="new-password">
                    <mat-icon matSuffix>lock</mat-icon>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                      Veuillez confirmer le mot de passe
                    </mat-error>
                    <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                      Les mots de passe ne correspondent pas
                    </mat-error>
                  </mat-form-field>

                  <div class="stepper-actions">
                    <button mat-button matStepperPrevious>Retour</button>
                    <button mat-raised-button color="primary" matStepperNext>
                      Suivant
                      <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 3: Personal Info -->
              <mat-step [stepControl]="personalForm">
                <form [formGroup]="personalForm">
                  <ng-template matStepLabel>Informations personnelles</ng-template>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Nom</mat-label>
                      <input matInput formControlName="nom" placeholder="Votre nom">
                      <mat-error *ngIf="personalForm.get('nom')?.hasError('required')">
                        Le nom est requis
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Prénom</mat-label>
                      <input matInput formControlName="prenom" placeholder="Votre prénom">
                      <mat-error *ngIf="personalForm.get('prenom')?.hasError('required')">
                        Le prénom est requis
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Téléphone</mat-label>
                    <input matInput
                           formControlName="telephone"
                           placeholder="06XXXXXXXX"
                           autocomplete="tel">
                    <mat-icon matSuffix>phone</mat-icon>
                    <mat-error *ngIf="personalForm.get('telephone')?.hasError('required')">
                      Le téléphone est requis
                    </mat-error>
                  </mat-form-field>

                  <div class="terms-checkbox">
                    <mat-checkbox formControlName="acceptTerms" color="primary">
                      J'accepte les <a href="#" (click)="$event.preventDefault()">termes et conditions</a>
                    </mat-checkbox>
                  </div>

                  <div class="stepper-actions">
                    <button mat-button matStepperPrevious>Retour</button>
                    <button mat-raised-button
                            color="primary"
                            (click)="onSubmit()"
                            [disabled]="!isFormValid() || loading()">
                      <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
                      <span *ngIf="!loading()">S'inscrire</span>
                    </button>
                  </div>
                </form>
              </mat-step>
            </mat-stepper>

            <div class="login-link">
              Vous avez déjà un compte?
              <a routerLink="/login">Se connecter</a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card-wrapper {
      max-width: 600px;
      width: 100%;
    }

    .register-card {
      margin: 0;
      border-radius: 12px;
      padding: 40px;
    }

    .logo-section {
      text-align: center;
      width: 100%;
      margin-bottom: 20px;
    }

    .logo {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .logo-section h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 600;
      color: #667eea;
    }

    .subtitle {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      margin-bottom: 20px;
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      border-radius: 4px;
      color: #c62828;
    }

    .error-message mat-icon {
      color: #f44336;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-field {
      width: 100%;
    }

    .terms-checkbox {
      margin: 16px 0 24px 0;
    }

    .terms-checkbox a {
      color: #667eea;
      text-decoration: none;
    }

    .terms-checkbox a:hover {
      text-decoration: underline;
    }

    .stepper-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      gap: 16px;
    }

    .stepper-actions button {
      min-width: 100px;
    }

    .login-link {
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
      margin-top: 24px;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      margin-left: 4px;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    ::ng-deep .mat-stepper-vertical {
      margin-top: 20px;
    }

    @media (max-width: 600px) {
      .register-card {
        padding: 24px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  accountForm: FormGroup;
  passwordForm: FormGroup;
  personalForm: FormGroup;

  loading = signal(false);
  hidePassword = signal(true);
  errorMessage = signal<string>('');

  constructor() {
    this.accountForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });

    this.personalForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  togglePasswordVisibility() {
    this.hidePassword.update(value => !value);
  }

  isFormValid(): boolean {
    return this.accountForm.valid &&
      this.passwordForm.valid &&
      this.personalForm.valid;
  }

  onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const registerData: RegisterRequest = {
      username: this.accountForm.value.username,
      email: this.accountForm.value.email,
      password: this.passwordForm.value.password,
      nom: this.personalForm.value.nom,
      prenom: this.personalForm.value.prenom,
      telephone: this.personalForm.value.telephone,
      roleNames: ['ROLE_CLIENT'] // Default role
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        // ✅ FIXED: AuthResponse has user data at root level, not in a 'user' property
        console.log('Registration successful:', {
          username: response.username,
          email: response.email,
          roles: response.roles
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.'
        );
      }
    });
  }
}
