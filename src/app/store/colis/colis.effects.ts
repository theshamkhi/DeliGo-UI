import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap, mergeMap } from 'rxjs/operators';
import { ColisService } from '../../core/services/colis.service';
import { ColisActions } from './colis.actions';
import { UIActions } from '../ui/ui.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../index';

@Injectable()
export class ColisEffects {
  private actions$ = inject(Actions);
  private colisService = inject(ColisService);
  private router = inject(Router);
  private store = inject(Store<AppState>);

  /**
   * Load All Colis Effect
   */
  loadColis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColisActions.loadColis),
      switchMap(({ pageRequest }) =>
        this.colisService.getAll(pageRequest).pipe(
          map((response) => ColisActions.loadColisSuccess({ response })),
          catchError((error) =>
            of(
              ColisActions.loadColisFailure({
                error: error.message || 'Échec du chargement des colis'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Load Colis By ID Effect
   */
  loadColisById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColisActions.loadColisById),
      mergeMap(({ id }) =>
        this.colisService.getById(id).pipe(
          map((colis) => ColisActions.loadColisByIdSuccess({ colis })),
          catchError((error) =>
            of(
              ColisActions.loadColisByIdFailure({
                error: error.message || 'Colis introuvable'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Search Colis Effect
   */
  searchColis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColisActions.searchColis),
      switchMap(({ keyword, pageRequest }) =>
        this.colisService.search(keyword, pageRequest).pipe(
          map((response) => ColisActions.searchColisSuccess({ response })),
          catchError((error) =>
            of(
              ColisActions.searchColisFailure({
                error: error.message || 'Échec de la recherche'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Create Colis Effect
   */
  createColis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColisActions.createColis),
      switchMap(({ colis }) =>
        this.colisService.create(colis).pipe(
          map((createdColis) => ColisActions.createColisSuccess({ colis: createdColis })),
          tap(() => {
            this.store.dispatch(
              UIActions.showSuccess({ message: 'Colis créé avec succès' })
            );
            this.router.navigate(['/colis']);
          }),
          catchError((error) =>
            of(
              ColisActions.createColisFailure({
                error: error.message || 'Échec de la création du colis'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Update Colis Effect
   */
  updateColis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColisActions.updateColis),
      switchMap(({ id, colis }) =>
        this.colisService.update(id, colis).pipe(
          map((updatedColis) => ColisActions.updateColisSuccess({ colis: updatedColis })),
          tap(() => {
            this.store.dispatch(
              UIActions.showSuccess({ message: 'Colis mis à jour avec succès' })
            );
            this.router.navigate(['/colis', id]);
          }),
          catchError((error) =>
            of(
              ColisActions.updateColisFailure({
                error: error.message || 'Échec de la mise à jour du colis'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Update Status Effect (with optimistic update)
   * The reducer already updated the UI, we just sync with backend
   */
  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColisActions.updateStatus),
      switchMap(({ id, statut, commentaire }) => {
        // Get the original colis for rollback if needed
        let originalColis: any = null;

        return this.colisService.updateStatus(id, statut, commentaire).pipe(
          map((colis) => {
            this.store.dispatch(
              UIActions.showSuccess({ message: 'Statut mis à jour avec succès' })
            );
            return ColisActions.updateStatusSuccess({ colis });
          }),
          catchError((error) => {
            this.store.dispatch(
              UIActions.showError({
                message: error.message || 'Échec de la mise à jour du statut'
              })
            );
            // Rollback to original state
            return of(
              ColisActions.updateStatusFailure({
                error: error.message,
                originalColis
              })
            );
          })
        );
      })
    )
  );

  /**
   * Delete Colis Effect
   */
  deleteColis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColisActions.deleteColis),
      switchMap(({ id }) =>
        this.colisService.delete(id).pipe(
          map(() => {
            this.store.dispatch(
              UIActions.showSuccess({ message: 'Colis supprimé avec succès' })
            );
            return ColisActions.deleteColisSuccess({ id });
          }),
          catchError((error) =>
            of(
              ColisActions.deleteColisFailure({
                error: error.message || 'Échec de la suppression du colis'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Assign Livreur Effect
   */
  assignLivreur$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColisActions.assignLivreur),
      switchMap(({ colisId, livreurId }) =>
        this.colisService.assignLivreur(colisId, livreurId).pipe(
          map((colis) => {
            this.store.dispatch(
              UIActions.showSuccess({ message: 'Livreur assigné avec succès' })
            );
            return ColisActions.assignLivreurSuccess({ colis });
          }),
          catchError((error) =>
            of(
              ColisActions.assignLivreurFailure({
                error: error.message || 'Échec de l\'assignation du livreur'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Show error on any colis failure
   */
  showError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ColisActions.loadColisFailure,
        ColisActions.createColisFailure,
        ColisActions.updateColisFailure,
        ColisActions.deleteColisFailure,
        ColisActions.assignLivreurFailure
      ),
      map(({ error }) => UIActions.showError({ message: error }))
    )
  );
}
